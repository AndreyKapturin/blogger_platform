import { createApp } from '../../src/app';
import { Express } from 'express';
import request from 'supertest';
import { Routes } from '../../src/app/routes';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import {
  BlogSortField,
  InputBlogType,
  ViewBlogQuery,
  ViewBlogType,
} from '../../src/entities/blogs/types';
import {
  DEFAULT_BLOG_PAGE_SIZE,
  DEFAULT_BLOG_SORT_BY,
  DEFAULT_BLOG_SORT_DIRECTION,
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../../src/entities/blogs/constants';
import {
  BlogsTestManagerType,
  correctInputBlog,
  createBlogsTestManager,
} from './utils/blogsTestManager';
import { createPostsTestManager, PostsTestManagerType } from './utils/PostsTestManager';
import { authHeader } from '../../src/core/constants';
import { ObjectId } from 'mongodb';
import { closeBbConnection } from '../../src/database/mongoDB';
import { SortDirection } from '../../src/core/types/PaginationAndSorting';
import { Paginator } from '../../src/core/types/PaginationAndSorting';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;

const notExistBlogId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
});

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`GET ${Routes.Blogs}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('and empty array if blogs not exist', async () => {
      const response = await request(app).get(Routes.Blogs);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body.items).toEqual([]);
    });

    it('and blogs array if blogs exist', async () => {
      const blog1Response = await blogsTestManager.createCorrectBlog({ name: 'Blog 1' });
      const blog2Response = await blogsTestManager.createCorrectBlog({ name: 'Blog 2' });
      const response = await request(app).get(Routes.Blogs);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body.items).toEqual([blog2Response.body, blog1Response.body]);
    });
  });
});

describe(`GET ${Routes.Blogs}/ with filters`, () => {
  let blog1: ViewBlogType;
  let blog2: ViewBlogType;
  let blog3: ViewBlogType;

  beforeEach(async () => {
    blog1 = (await blogsTestManager.createCorrectBlog({ name: 'Blog 1' })).body;
    blog2 = (await blogsTestManager.createCorrectBlog({ name: 'Blog 2' })).body;
    blog3 = (await blogsTestManager.createCorrectBlog({ name: 'Blog 3' })).body;
  });

  it('search by name', async () => {
    const filters: Partial<ViewBlogQuery> = {
      searchNameTerm: '2',
    };
    const response = await request(app).get(Routes.Blogs).query(filters);
    const expectedBody: Paginator<ViewBlogType> = {
      page: 1,
      pagesCount: 1,
      pageSize: DEFAULT_BLOG_PAGE_SIZE,
      totalCount: 1,
      items: [blog2],
    };
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedBody);
  });

  it('search by unexisted name', async () => {
    const filters: Partial<ViewBlogQuery> = {
      searchNameTerm: 'nfksdanfsk',
    };
    const response = await request(app).get(Routes.Blogs).query(filters);
    const expectedBody: Paginator<ViewBlogType> = {
      page: 1,
      pagesCount: 1,
      pageSize: DEFAULT_BLOG_PAGE_SIZE,
      totalCount: 0,
      items: [],
    };
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedBody);
  });

  it(`default sort: field - ${DEFAULT_BLOG_SORT_BY}, direction - ${DEFAULT_BLOG_SORT_DIRECTION}`, async () => {
    const filters: Partial<ViewBlogQuery> = {};
    const response = await request(app).get(Routes.Blogs).query(filters);
    const expectedBody: Paginator<ViewBlogType> = {
      page: 1,
      pagesCount: 1,
      pageSize: DEFAULT_BLOG_PAGE_SIZE,
      totalCount: 3,
      items: [blog3, blog2, blog1],
    };
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedBody);
  });

  it(`${SortDirection.Asc} sort by ${BlogSortField.Name} field`, async () => {
    const filters: Partial<ViewBlogQuery> = {
      sortBy: BlogSortField.Name,
      sortDirection: SortDirection.Asc,
    };
    const response = await request(app).get(Routes.Blogs).query(filters);
    const expectedBody: Paginator<ViewBlogType> = {
      page: 1,
      pagesCount: 1,
      pageSize: DEFAULT_BLOG_PAGE_SIZE,
      totalCount: 3,
      items: [blog1, blog2, blog3],
    };
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedBody);
  });
});

describe(`GET ${Routes.Blogs}/:id`, () => {
  describe(`should return ${HttpStatus.Ok} status code and blog if blog is found`, () => {
    it('blog is exist', async () => {
      const postResponse = await blogsTestManager.createCorrectBlog();
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Ok);
      expect(getResponse.body).toEqual(postResponse.body);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const getResponse = await request(app).get(`${Routes.Blogs}/${notExistBlogId}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
});

describe(`POST ${Routes.Blogs}`, () => {
  describe(`should create blog, return ${HttpStatus.Created} status code and blog`, () => {
    it('all data is correct', async () => {
      await blogsTestManager.createCorrectBlog();
    });

    it('name has spaces', async () => {
      await blogsTestManager.createCorrectBlog(
        { name: '   IT-INCUBATOR  ' },
        { name: 'IT-INCUBATOR' },
      );
    });

    it('name length equal 1', async () => {
      await blogsTestManager.createCorrectBlog({ name: 'p' });
    });

    it('description length equal 1', async () => {
      await blogsTestManager.createCorrectBlog({ description: 'p' });
    });

    it(`name length equal max: ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await blogsTestManager.createCorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH) });
    });

    it(`description length equal max: ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await blogsTestManager.createCorrectBlog({
        description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH),
      });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await blogsTestManager.createCorrectBlog({ websiteUrl: longUrl });
    });

    const correctURLs = [
      'https://it-incubator.io',
      'https://it_incubator.io',
      'https://it__incubator.io',
      'https://it-incubator2026.io',
      'https://it-incubator.com',
      'https://it-incubator.io/',
      'https://IT-incubator.io/',
      'https://it-incubator.io/courses',
      'https://it-incubator.io/courses/2',
      'https://it-incubator.io/students/courses/2',
    ];

    for (const correctURL of correctURLs) {
      it(`websiteUrl is correct: ${correctURL}`, async () => {
        await blogsTestManager.createCorrectBlog({ websiteUrl: correctURL });
      });
    }
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await blogsTestManager.createInorrectBlog({ description: '' }, ['name']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
        ]),
      );
    });

    for (const key in correctInputBlog) {
      it(`${key} not passed`, async () => {
        await blogsTestManager.createInorrectBlog({}, [key as keyof InputBlogType]);
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is empty string`, async () => {
        await blogsTestManager.createInorrectBlog({ [key as keyof InputBlogType]: '' });
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is not string`, async () => {
        await blogsTestManager.createInorrectBlog({ [key as keyof InputBlogType]: 10 });
      });
    }

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await blogsTestManager.createInorrectBlog({
        description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1),
      });
    });

    it(`name length more than ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await blogsTestManager.createInorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH + 1) });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      await blogsTestManager.createInorrectBlog({
        websiteUrl: 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH + 1),
      });
    });

    const incorrectURLs = [
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ];

    for (const incorrectURL of incorrectURLs) {
      it(`websiteUrl is incorrect: ${incorrectURL}`, async () => {
        await blogsTestManager.createInorrectBlog({ websiteUrl: incorrectURL });
      });
    }
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      await request(app).post(Routes.Blogs).send(correctInputBlog).expect(HttpStatus.Unauthorized);
    });
  });
});

describe(`PUT ${Routes.Blogs}/:id`, () => {
  describe(`should update blog, return ${HttpStatus.No_Content} status code`, () => {
    it('all data is correct', async () => {
      const dataForUpdate = {
        name: 'IT-INCUBATOR',
        description: 'Best programming school ever',
        websiteUrl: 'https://it-incubator.io',
      };
      await blogsTestManager.correctUpdateBlog(dataForUpdate);
    });

    it('name has spaces', async () => {
      await blogsTestManager.correctUpdateBlog(
        { name: '   IT-INCUBATOR  ' },
        { name: 'IT-INCUBATOR' },
      );
    });

    it('send double request', async () => {
      const postResponse = await blogsTestManager.createCorrectBlog();

      const updateResponse1 = await request(app)
        .put(`${Routes.Blogs}/${postResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({ ...postResponse.body, name: 'Updated name' });
      expect(updateResponse1.status).toBe(HttpStatus.No_Content);

      const updateResponse2 = await request(app)
        .put(`${Routes.Blogs}/${postResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({ ...postResponse.body, name: 'Updated name' });
      expect(updateResponse2.status).toBe(HttpStatus.No_Content);
    });

    it('name length equal 1', async () => {
      await blogsTestManager.correctUpdateBlog({ name: 'p' });
    });

    it('description length equal 1', async () => {
      await blogsTestManager.correctUpdateBlog({ description: 'p' });
    });

    it(`name length equal max: ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await blogsTestManager.correctUpdateBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH) });
    });

    it(`description length equal max: ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await blogsTestManager.correctUpdateBlog({
        description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH),
      });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await blogsTestManager.correctUpdateBlog({ websiteUrl: longUrl });
    });

    const correctURLs = [
      'https://it-incubator.io',
      'https://it_incubator.io',
      'https://it__incubator.io',
      'https://it-incubator2026.io',
      'https://it-incubator.com',
      'https://it-incubator.io/',
      'https://IT-incubator.io/',
      'https://it-incubator.io/courses',
      'https://it-incubator.io/courses/2',
      'https://it-incubator.io/students/courses/2',
    ];

    for (const correctURL of correctURLs) {
      it(`websiteUrl is correct: ${correctURL}`, async () => {
        await blogsTestManager.correctUpdateBlog({ websiteUrl: correctURL });
      });
    }

    it('posts belonging to the blog are updated along with the blog', async () => {
      const initialBlogName = 'Blog name';
      const updatedBlogName = 'Updated name';
      const createBlogResponse = await blogsTestManager.createCorrectBlog({
        name: initialBlogName,
      });
      const createPost1Response = await postsTestManager.createCorrectPost(
        createBlogResponse.body,
        {
          title: 'Post 1',
        },
      );
      const createPost2Response = await postsTestManager.createCorrectPost(
        createBlogResponse.body,
        {
          title: 'Post 2',
        },
      );

      const post1GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost1Response.body.id}`,
      );
      expect(post1GetResponse.status).toBe(HttpStatus.Ok);
      expect(post1GetResponse.body.blogName).toEqual(initialBlogName);

      const post2GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost2Response.body.id}`,
      );
      expect(post2GetResponse.status).toBe(HttpStatus.Ok);
      expect(post2GetResponse.body.blogName).toEqual(initialBlogName);

      const updateBlogResponse = await request(app)
        .put(`${Routes.Blogs}/${createBlogResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({
          name: updatedBlogName,
          description: createBlogResponse.body.description,
          websiteUrl: createBlogResponse.body.websiteUrl,
        });
      expect(updateBlogResponse.status).toBe(HttpStatus.No_Content);

      const afterBlogUpdatePost1GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost1Response.body.id}`,
      );
      expect(afterBlogUpdatePost1GetResponse.status).toBe(HttpStatus.Ok);
      expect(afterBlogUpdatePost1GetResponse.body.blogName).toEqual(updatedBlogName);

      const afterBlogUpdatePost2GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost2Response.body.id}`,
      );
      expect(afterBlogUpdatePost2GetResponse.status).toBe(HttpStatus.Ok);
      expect(afterBlogUpdatePost2GetResponse.body.blogName).toEqual(updatedBlogName);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const response = await request(app)
        .put(`${Routes.Blogs}/${notExistBlogId}`)
        .set('Authorization', authHeader)
        .send(correctInputBlog);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await blogsTestManager.incorrectUpdateBlog({ description: '' }, ['name']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
        ]),
      );
    });

    for (const key in correctInputBlog) {
      it(`${key} not passed`, async () => {
        await blogsTestManager.incorrectUpdateBlog({}, [key as keyof InputBlogType]);
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is empty string`, async () => {
        await blogsTestManager.incorrectUpdateBlog({ [key as keyof InputBlogType]: '' });
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is not string`, async () => {
        await blogsTestManager.incorrectUpdateBlog({ [key as keyof InputBlogType]: 10 });
      });
    }

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await blogsTestManager.incorrectUpdateBlog({
        description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1),
      });
    });

    it(`name length more than ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await blogsTestManager.incorrectUpdateBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH + 1) });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      await blogsTestManager.incorrectUpdateBlog({
        websiteUrl: 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH + 1),
      });
    });

    const incorrectURLs = [
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ];

    for (const incorrectURL of incorrectURLs) {
      it(`websiteUrl is incorrect: ${incorrectURL}`, async () => {
        await blogsTestManager.incorrectUpdateBlog({ websiteUrl: incorrectURL });
      });
    }
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await blogsTestManager.createCorrectBlog();
      const { id, ...updatedBlog } = { ...createRespone.body, name: 'New blog name' };
      await request(app)
        .put(`${Routes.Blogs}/${id}`)
        .send(updatedBlog)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

describe(`DELETE ${Routes.Blogs}/:id`, () => {
  describe(`should return ${HttpStatus.No_Content} status code if blog was successfuly deleted`, () => {
    it('blog exist', async () => {
      const postResponse = await blogsTestManager.createCorrectBlog();
      const deleteResponse = await request(app)
        .delete(`${Routes.Blogs}/${postResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(deleteResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });

    it('posts belonging to the blog are deleted along with the blog', async () => {
      const createBlogResponse = await blogsTestManager.createCorrectBlog();
      const createPost1Response = await postsTestManager.createCorrectPost(
        createBlogResponse.body,
        {
          title: 'Post 1',
        },
      );
      const createPost2Response = await postsTestManager.createCorrectPost(
        createBlogResponse.body,
        {
          title: 'Post 2',
        },
      );

      const post1GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost1Response.body.id}`,
      );
      expect(post1GetResponse.status).toBe(HttpStatus.Ok);
      expect(post1GetResponse.body).toEqual(createPost1Response.body);
      expect(post1GetResponse.body.blogId).toEqual(createBlogResponse.body.id);

      const post2GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost2Response.body.id}`,
      );
      expect(post2GetResponse.status).toBe(HttpStatus.Ok);
      expect(post2GetResponse.body).toEqual(createPost2Response.body);
      expect(post2GetResponse.body.blogId).toEqual(createBlogResponse.body.id);

      const deleteBlogResponse = await request(app)
        .delete(`${Routes.Blogs}/${createBlogResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(deleteBlogResponse.status).toBe(HttpStatus.No_Content);

      await request(app)
        .get(`${Routes.Posts}/${createPost1Response.body.id}`)
        .expect(HttpStatus.Not_Found);

      await request(app)
        .get(`${Routes.Posts}/${createPost2Response.body.id}`)
        .expect(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const response = await request(app)
        .delete(`${Routes.Blogs}/${notExistBlogId}`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await blogsTestManager.createCorrectBlog();
      await request(app)
        .delete(`${Routes.Blogs}/${createRespone.body.id}`)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});

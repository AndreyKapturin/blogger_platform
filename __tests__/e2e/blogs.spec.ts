import { createApp } from '../../src/app';
import request from 'supertest';
import { Routes } from '../../src/app/routes';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import { InputBlogType } from '../../src/entities/blogs/types';
import {
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../../src/entities/blogs/constants';
import { correctInputBlog, createBlogsTestManager } from './utils/blogsTestManager';
import { createPostsTestManager } from './utils/PostsTestManager';
import { authHeader } from '../../src/core/constants';

const app = createApp();
const { createCorrectBlog, createInorrectBlog, correctUpdateBlog, incorrectUpdateBlog } =
  createBlogsTestManager(app);
const { createCorrectPost } = createPostsTestManager(app);

const notExistBlogId = 'p'.repeat(5);

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`GET ${Routes.Blogs}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('and empty array if blogs not exist', async () => {
      const response = await request(app).get(Routes.Blogs);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([]);
    });

    it('and blogs array if blogs exist', async () => {
      const blog1Response = await createCorrectBlog({ name: 'Blog 1' });
      const blog2Response = await createCorrectBlog({ name: 'Blog 2' });
      const response = await request(app).get(Routes.Blogs);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([blog1Response.body, blog2Response.body]);
    });
  });
});

describe(`GET ${Routes.Blogs}/:id`, () => {
  describe(`should return ${HttpStatus.Ok} status code and blog if blog is found`, () => {
    it('blog is exist', async () => {
      const postResponse = await createCorrectBlog();
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
      await createCorrectBlog();
    });

    it('name has spaces', async () => {
      await createCorrectBlog({ name: '   IT-INCUBATOR  ' }, { name: 'IT-INCUBATOR' });
    });

    it('name length equal 1', async () => {
      await createCorrectBlog({ name: 'p' });
    });

    it('description length equal 1', async () => {
      await createCorrectBlog({ description: 'p' });
    });

    it(`name length equal max: ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await createCorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH) });
    });

    it(`description length equal max: ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await createCorrectBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH) });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await createCorrectBlog({ websiteUrl: longUrl });
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
        await createCorrectBlog({ websiteUrl: correctURL });
      });
    }
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await createInorrectBlog({ description: '' }, ['name']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
        ])
      );
    });

    for (const key in correctInputBlog) {
      it(`${key} not passed`, async () => {
        await createInorrectBlog({}, [key as keyof InputBlogType]);
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is empty string`, async () => {
        await createInorrectBlog({ [key as keyof InputBlogType]: '' });
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is not string`, async () => {
        await createInorrectBlog({ [key as keyof InputBlogType]: 10 });
      });
    }

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await createInorrectBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1) });
    });

    it(`name length more than ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await createInorrectBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH + 1) });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      await createInorrectBlog({ websiteUrl: 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH + 1) });
    });

    const incorrectURLs = [
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ];

    for (const incorrectURL of incorrectURLs) {
      it(`websiteUrl is incorrect: ${incorrectURL}`, async () => {
        await createInorrectBlog({ websiteUrl: incorrectURL });
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
      await correctUpdateBlog(dataForUpdate);
    });

    it('name has spaces', async () => {
      await correctUpdateBlog({ name: '   IT-INCUBATOR  ' }, { name: 'IT-INCUBATOR' });
    });

    it('name length equal 1', async () => {
      await correctUpdateBlog({ name: 'p' });
    });

    it('description length equal 1', async () => {
      await correctUpdateBlog({ description: 'p' });
    });

    it(`name length equal max: ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await correctUpdateBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH) });
    });

    it(`description length equal max: ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await correctUpdateBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH) });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await correctUpdateBlog({ websiteUrl: longUrl });
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
        await correctUpdateBlog({ websiteUrl: correctURL });
      });
    }
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
      const response = await incorrectUpdateBlog({ description: '' }, ['name']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
        ])
      );
    });

    for (const key in correctInputBlog) {
      it(`${key} not passed`, async () => {
        await incorrectUpdateBlog({}, [key as keyof InputBlogType]);
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is empty string`, async () => {
        await incorrectUpdateBlog({ [key as keyof InputBlogType]: '' });
      });
    }

    for (const key in correctInputBlog) {
      it(`${key} is not string`, async () => {
        await incorrectUpdateBlog({ [key as keyof InputBlogType]: 10 });
      });
    }

    it(`description length more than ${MAX_BLOG_DESCRIPTION_LENGTH}`, async () => {
      await incorrectUpdateBlog({ description: 'p'.repeat(MAX_BLOG_DESCRIPTION_LENGTH + 1) });
    });

    it(`name length more than ${MAX_BLOG_NAME_LENGTH}`, async () => {
      await incorrectUpdateBlog({ name: 'p'.repeat(MAX_BLOG_NAME_LENGTH + 1) });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      await incorrectUpdateBlog({ websiteUrl: 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH + 1) });
    });

    const incorrectURLs = [
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ];

    for (const incorrectURL of incorrectURLs) {
      it(`websiteUrl is incorrect: ${incorrectURL}`, async () => {
        await incorrectUpdateBlog({ websiteUrl: incorrectURL });
      });
    }
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await createCorrectBlog();
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
      const postResponse = await createCorrectBlog();
      const deleteResponse = await request(app)
        .delete(`${Routes.Blogs}/${postResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(deleteResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });

    it('posts belonging to the blog are deleted along with the blog', async () => {
      const createBlogResponse = await createCorrectBlog();
      const createPost1Response = await createCorrectPost(createBlogResponse.body, {
        title: 'Post 1',
      });
      const createPost2Response = await createCorrectPost(createBlogResponse.body, {
        title: 'Post 2',
      });

      const post1GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost1Response.body.id}`
      );
      expect(post1GetResponse.status).toBe(HttpStatus.Ok);
      expect(post1GetResponse.body).toEqual(createPost1Response.body);
      expect(post1GetResponse.body.blogId).toEqual(createBlogResponse.body.id);

      const post2GetResponse = await request(app).get(
        `${Routes.Posts}/${createPost2Response.body.id}`
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
      const createRespone = await createCorrectBlog();
      await request(app)
        .delete(`${Routes.Blogs}/${createRespone.body.id}`)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

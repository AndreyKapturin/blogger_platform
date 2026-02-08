import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { authHeader } from '../../../../src/core/constants';
import {
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../../../../src/entities/blogs/constants';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/PostsTestManager';
import { ObjectId } from 'mongodb';
import { InputBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
const notExistBlogId = new ObjectId().toString();
const inputBlogKeys: (keyof InputBlogType)[] = ['description', 'name', 'websiteUrl'];
const correctUpdatedBlogData: InputBlogType = {
  name: 'Updated name',
  description: 'Updated blog description',
  websiteUrl: 'https://IT-INCUBATOR.IO',
};

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
});

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`PUT ${Routes.Blogs}/:id`, () => {
  describe(`should update blog, return ${HttpStatus.No_Content} status code`, () => {
    it('all data is correct', async () => {
      await blogsTestManager.correctUpdateBlog(correctUpdatedBlogData);
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

    it.each(['name', 'description'])('%s length equal 1', async (fieldName) => {
      await blogsTestManager.correctUpdateBlog({ [fieldName]: 'p' });
    });

    it.each([
      ['name', MAX_BLOG_NAME_LENGTH],
      ['description', MAX_BLOG_DESCRIPTION_LENGTH],
    ])('%s length equal max: %i', async (fieldName, maxValue) => {
      await blogsTestManager.correctUpdateBlog({ [fieldName]: 'p'.repeat(maxValue) });
    });

    it(`websiteUrl length equal max: ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH - 12) + '.io';
      await blogsTestManager.correctUpdateBlog({ websiteUrl: longUrl });
    });

    it.each([
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
    ])('websiteUrl is correct: %s', async (correctURL) => {
      await blogsTestManager.correctUpdateBlog({ websiteUrl: correctURL });
    });

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
        .send(correctUpdatedBlogData);
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

    it.each(inputBlogKeys)('%s not passed', async (key) => {
      await blogsTestManager.incorrectUpdateBlog({}, [key]);
    });

    it.each(inputBlogKeys)('%s is empty string', async (key) => {
      await blogsTestManager.incorrectUpdateBlog({ [key]: '' });
    });

    it.each(inputBlogKeys)('%s  is not string', async (key) => {
      await blogsTestManager.incorrectUpdateBlog({ [key]: 10 });
    });

    it.each([
      ['description', MAX_BLOG_DESCRIPTION_LENGTH],
      ['name', MAX_BLOG_NAME_LENGTH],
    ])('%s length more than %i', async (fieldName, maxValue) => {
      await blogsTestManager.incorrectUpdateBlog({
        [fieldName]: 'p'.repeat(maxValue + 1),
      });
    });

    it(`websiteUrl length more than ${MAX_BLOG_WEBSITE_URL_LENGTH}`, async () => {
      const longUrl = 'https://' + 'p'.repeat(MAX_BLOG_WEBSITE_URL_LENGTH) + '.io';
      await blogsTestManager.createInorrectBlog({ websiteUrl: longUrl });
    });

    it.each([
      'http://it-incubator.io',
      'https:/it-incubator.io',
      'https:/it-incubator',
      'it-incubator.io',
    ])('websiteUrl is incorrect: %s', async (incorrectURL) => {
      await blogsTestManager.incorrectUpdateBlog({ websiteUrl: incorrectURL });
    });
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

afterAll(async () => {
  await closeBbConnection();
});

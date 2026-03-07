import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { ObjectId } from 'mongodb';
import { createApp } from '../../../../src/app';
import { InputBlogPostType, ViewPostType } from '../../../../src/entities/posts/types';
import request from 'supertest';
import { authHeader } from '../../../../src/core/constants';
import { ISODateStringRegExp } from '../../utils/constants';
import { closeBbConnection } from '../../../../src/database/mongoDB';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
const notExistBlogId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
});

beforeEach(async () => {
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
});

describe(`POST ${Routes.BlogPostsById(':id')}`, () => {
  describe(`should create post for blog, return ${HttpStatus.Created} status code and post`, () => {
    it('all data is correct', async () => {
      const blog = (await blogsTestManager.createCorrectBlog({ name: 'Blog 1' })).body;
      const inputPost: InputBlogPostType = {
        title: 'bla',
        content: 'bla bla bla'.repeat(3),
        shortDescription: 'bla bla bla',
      };

      const createPostResponse = await request(app)
        .post(Routes.BlogPostsById(blog.id))
        .set('Authorization', authHeader)
        .send(inputPost);

      const expectedBody: ViewPostType = {
        id: expect.any(String),
        title: inputPost.title,
        content: inputPost.content,
        shortDescription: inputPost.shortDescription,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.stringMatching(ISODateStringRegExp),
      };

      expect(createPostResponse.status).toBe(HttpStatus.Created);
      expect(createPostResponse.body).toEqual(expectedBody);
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const blog = (await blogsTestManager.createCorrectBlog({ name: 'Blog 1' })).body;
      const inputPost = {
        content: 10,
        shortDescription: 'bla bla bla',
      };

      const createPostResponse = await request(app)
        .post(Routes.BlogPostsById(blog.id))
        .set('Authorization', authHeader)
        .send(inputPost);

      expect(createPostResponse.status).toBe(HttpStatus.Bad_Request);
      expect(createPostResponse.body).toEqual({
        errorsMessages: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
      expect(createPostResponse.body.errorsMessages).toHaveLength(2);
    });
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const blog = (await blogsTestManager.createCorrectBlog({ name: 'Blog 1' })).body;
      const inputPost: InputBlogPostType = {
        title: 'bla',
        content: 'bla bla bla'.repeat(3),
        shortDescription: 'bla bla bla',
      };

      const createPostResponse = await request(app)
        .post(Routes.BlogPostsById(blog.id))
        .send(inputPost);
      expect(createPostResponse.status).toBe(HttpStatus.Unauthorized);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const inputPost: InputBlogPostType = {
        title: 'bla',
        content: 'bla bla bla'.repeat(3),
        shortDescription: 'bla bla bla',
      };

      const createPostResponse = await request(app)
        .post(Routes.BlogPostsById(notExistBlogId))
        .set('Authorization', authHeader)
        .send(inputPost);

      expect(createPostResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});
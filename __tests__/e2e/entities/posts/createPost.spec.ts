import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { correctInputPostData, createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { InputPostType } from '../../../../src/entities/posts/types';
import { MAX_POST_CONTENT_LENGTH, MAX_POST_SHORT_DESCRIPTION_LENGTH, MAX_POST_TITLE_LENGTH } from '../../../../src/entities/posts/constants';
import { authHeader } from '../../../../src/core/constants';
import { ObjectId } from 'mongodb';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let blog: ViewBlogType;
const notExistBlogId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  blog = (await blogsTestManager.createCorrectBlog()).body;
});

describe(`POST ${Routes.Posts}`, () => {
  describe(`should create post, return ${HttpStatus.Created} status code and post`, () => {
    it('all data is correct', async () => {
      await postsTestManager.createCorrectPost(blog);
    });

    it('title has spaces', async () => {
      await postsTestManager.createCorrectPost(
        blog,
        { title: '   Express tutorial  ' },
        { title: 'Express tutorial' },
      );
    });

    it('title length equal 1', async () => {
      await postsTestManager.createCorrectPost(blog, { title: 'p' });
    });

    it('content length equal 1', async () => {
      await postsTestManager.createCorrectPost(blog, { content: 'p' });
    });

    it('shortDescription length equal 1', async () => {
      await postsTestManager.createCorrectPost(blog, { shortDescription: 'p' });
    });

    it(`title length equal max: ${MAX_POST_TITLE_LENGTH}`, async () => {
      await postsTestManager.createCorrectPost(blog, { title: 'p'.repeat(MAX_POST_TITLE_LENGTH) });
    });

    it(`content length equal max: ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await postsTestManager.createCorrectPost(blog, {
        content: 'p'.repeat(MAX_POST_CONTENT_LENGTH),
      });
    });

    it(`shortDescription length equal max: ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await postsTestManager.createCorrectPost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH),
      });
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await postsTestManager.createInorrectPost({ content: '' }, ['title']);
      expect(response.body.errorsMessages.length).toBe(3);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'content' }),
          expect.objectContaining({ field: 'title' }),
          expect.objectContaining({ field: 'blogId' }),
        ]),
      );
    });

    for (const key in correctInputPostData) {
      it(`${key} not passed`, async () => {
        await postsTestManager.createInorrectPost({}, [key as keyof InputPostType]);
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is empty string`, async () => {
        await postsTestManager.createInorrectPost({ [key as keyof InputPostType]: '' });
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is not string`, async () => {
        await postsTestManager.createInorrectPost({ [key as keyof InputPostType]: 10 });
      });
    }

    it(`title length more than ${MAX_POST_TITLE_LENGTH}`, async () => {
      await postsTestManager.createInorrectPost({ title: 'p'.repeat(MAX_POST_TITLE_LENGTH + 1) });
    });

    it(`content length more than ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await postsTestManager.createInorrectPost({
        content: 'p'.repeat(MAX_POST_CONTENT_LENGTH + 1),
      });
    });

    it(`shortDescription length more than ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await postsTestManager.createInorrectPost({
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH + 1),
      });
    });
  });
  describe(`should return ${HttpStatus.Not_Found} status code`, () => {
    it(`blog with passed blogId not existed`, async () => {
      const createPostResponse = await request(app)
        .post(Routes.Posts)
        .set('Authorization', authHeader)
        .send({
          ...correctInputPostData,
          blogId: notExistBlogId,
        });
      expect(createPostResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      await request(app)
        .post(Routes.Posts)
        .send(correctInputPostData)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});
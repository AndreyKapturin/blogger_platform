import { createApp } from '../../src/app';
import { Routes } from '../../src/app/routes';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import { Express } from 'express';
import request from 'supertest';
import { InputPostType } from '../../src/entities/posts/types';
import { ViewBlogType } from '../../src/entities/blogs/types';
import { BlogsTestManagerType, createBlogsTestManager } from './utils/blogsTestManager';
import {
  createPostsTestManager,
  correctInputPostData,
  PostsTestManagerType,
} from './utils/PostsTestManager';
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
  MAX_POST_TITLE_LENGTH,
} from '../../src/entities/posts/constants';
import { authHeader } from '../../src/core/constants';
import { ObjectId } from 'mongodb';

import { closeBbConnection } from '../../src/database/mongoDB';

let blog: ViewBlogType;

const notExistPostId = new ObjectId().toString();
const notExistBlogId = new ObjectId().toString();

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
});

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  blog = (await blogsTestManager.createCorrectBlog()).body as ViewBlogType;
  correctInputPostData.blogId = blog.id;
});

describe(`GET ${Routes.Posts}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('and empty array if posts not exist', async () => {
      const response = await request(app).get(Routes.Posts);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([]);
    });

    it('and posts array if posts exist', async () => {
      const post1Response = await postsTestManager.createCorrectPost(blog, { title: 'Post 1' });
      const post2Response = await postsTestManager.createCorrectPost(blog, { title: 'Post 2' });
      const response = await request(app).get(Routes.Posts);
      expect(response.status).toBe(HttpStatus.Ok);
      expect(response.body).toEqual([post1Response.body, post2Response.body]);
    });
  });
});

describe(`GET ${Routes.Posts}/:id`, () => {
  describe(`should return ${HttpStatus.Ok} status code and post if post is found`, () => {
    it('post is exist', async () => {
      const postResponse = await postsTestManager.createCorrectPost(blog);
      const getResponse = await request(app).get(`${Routes.Posts}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Ok);
      expect(getResponse.body).toEqual(postResponse.body);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const getResponse = await request(app).get(`${Routes.Posts}/${notExistPostId}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
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
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'content' }),
          expect.objectContaining({ field: 'title' }),
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

    it(`blog with passed blogId not existed`, async () => {
      await postsTestManager.createInorrectPost({ blogId: notExistBlogId });
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

describe(`PUT ${Routes.Posts}/:id`, () => {
  describe(`should update post, return ${HttpStatus.No_Content} status code`, () => {
    it('all data is correct', async () => {
      const dataForUpdate: Partial<InputPostType> = {
        title: 'How create express app?',
        content: 'a'.repeat(110),
        shortDescription: 'd'.repeat(45),
      };
      await postsTestManager.correctUpdatePost(blog, dataForUpdate);
    });

    it('send double request', async () => {
      const postResponse = await postsTestManager.createCorrectPost(blog);
      
      const updateResponse1 = await request(app)
        .put(`${Routes.Posts}/${postResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({ ...postResponse.body, title: 'Updated title' });
      expect(updateResponse1.status).toBe(HttpStatus.No_Content);

      const updateResponse2 = await request(app)
        .put(`${Routes.Posts}/${postResponse.body.id}`)
        .set('Authorization', authHeader)
        .send({ ...postResponse.body, title: 'Updated title' });
      expect(updateResponse2.status).toBe(HttpStatus.No_Content);
    });

    it('title has spaces', async () => {
      await postsTestManager.correctUpdatePost(
        blog,
        { title: '   Express tutorial  ' },
        { title: 'Express tutorial' },
      );
    });

    it('title length equal 1', async () => {
      await postsTestManager.correctUpdatePost(blog, { title: 'p' });
    });

    it('content length equal 1', async () => {
      await postsTestManager.correctUpdatePost(blog, { content: 'p' });
    });

    it('shortDescription length equal 1', async () => {
      await postsTestManager.correctUpdatePost(blog, { shortDescription: 'p' });
    });

    it(`title length equal max: ${MAX_POST_TITLE_LENGTH}`, async () => {
      await postsTestManager.correctUpdatePost(blog, { title: 'p'.repeat(MAX_POST_TITLE_LENGTH) });
    });

    it(`content length equal max: ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await postsTestManager.correctUpdatePost(blog, {
        content: 'p'.repeat(MAX_POST_CONTENT_LENGTH),
      });
    });

    it(`shortDescription length equal max: ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await postsTestManager.correctUpdatePost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH),
      });
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const response = await request(app)
        .put(`${Routes.Posts}/${notExistPostId}`)
        .set('Authorization', authHeader)
        .send(correctInputPostData);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Bad_Request}`, () => {
    it('several fields has error', async () => {
      const response = await postsTestManager.incorrectUpdatePost(blog, { content: '' }, ['title']);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'content' }),
          expect.objectContaining({ field: 'title' }),
        ]),
      );
    });

    for (const key in correctInputPostData) {
      it(`${key} not passed`, async () => {
        await postsTestManager.incorrectUpdatePost(blog, {}, [key as keyof InputPostType]);
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is empty string`, async () => {
        await postsTestManager.incorrectUpdatePost(blog, { [key as keyof InputPostType]: '' });
      });
    }

    for (const key in correctInputPostData) {
      it(`${key} is not string`, async () => {
        await postsTestManager.incorrectUpdatePost(blog, { [key as keyof InputPostType]: 10 });
      });
    }

    it(`title length more than ${MAX_POST_TITLE_LENGTH}`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, {
        title: 'p'.repeat(MAX_POST_TITLE_LENGTH + 1),
      });
    });

    it(`content length more than ${MAX_POST_CONTENT_LENGTH}`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, {
        content: 'p'.repeat(MAX_POST_CONTENT_LENGTH + 1),
      });
    });

    it(`shortDescription length more than ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, {
        shortDescription: 'p'.repeat(MAX_POST_SHORT_DESCRIPTION_LENGTH + 1),
      });
    });

    it(`blog with passed blogId not existed`, async () => {
      await postsTestManager.incorrectUpdatePost(blog, { blogId: notExistBlogId });
    });
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await postsTestManager.createCorrectPost(blog);
      const { id, blogName, ...updatedPost } = { ...createRespone.body, title: 'New post title' };
      await request(app)
        .put(`${Routes.Posts}/${id}`)
        .send(updatedPost)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

describe(`DELETE ${Routes.Posts}/:id`, () => {
  describe(`should return ${HttpStatus.No_Content} status code if post was successfuly deleted`, () => {
    it('post exist', async () => {
      const postResponse = await postsTestManager.createCorrectPost(blog);
      const deleteResponse = await request(app)
        .delete(`${Routes.Posts}/${postResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(deleteResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(`${Routes.Posts}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const response = await request(app)
        .delete(`${Routes.Posts}/${notExistPostId}`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await postsTestManager.createCorrectPost(blog);
      await request(app)
        .delete(`${Routes.Posts}/${createRespone.body.id}`)
        .expect(HttpStatus.Unauthorized);
    });
  });
});

it('true to be true', () => {
  expect(true).toBe(true);
});

afterAll(async () => {
  await closeBbConnection();
});

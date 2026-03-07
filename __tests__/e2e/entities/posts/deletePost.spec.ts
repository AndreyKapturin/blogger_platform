import { Express } from 'express';
import { Routes } from "../../../../src/app/routes";
import { HttpStatus } from "../../../../src/core/types/HttpStatus";
import request from 'supertest';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createApp } from '../../../../src/app';
import { ObjectId } from 'mongodb';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader } from '../../../../src/core/constants';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
const notExistPostId = new ObjectId().toString();
let blog: ViewBlogType;


beforeAll(async () => {
  app = await createApp();
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  blog = (await blogsTestManager.createCorrectBlog()).body;
});

describe(`DELETE ${Routes.PostById(':id')}`, () => {
  describe(`should return ${HttpStatus.No_Content} status code if post was successfuly deleted`, () => {
    it('post exist', async () => {
      const postResponse = await postsTestManager.createCorrectPost(blog);
      const deleteResponse = await request(app)
        .delete(Routes.PostById(postResponse.body.id))
        .set('Authorization', authHeader);
      expect(deleteResponse.status).toBe(HttpStatus.No_Content);
      const getResponse = await request(app).get(Routes.PostById(postResponse.body.id));
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if post not found`, () => {
    it('post not exist', async () => {
      const response = await request(app)
        .delete(Routes.PostById(notExistPostId))
        .set('Authorization', authHeader);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });

  describe(`should return ${HttpStatus.Unauthorized}`, () => {
    it('if auth header incorrect', async () => {
      const createRespone = await postsTestManager.createCorrectPost(blog);
      await request(app)
        .delete(Routes.PostById(createRespone.body.id))
        .expect(HttpStatus.Unauthorized);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});
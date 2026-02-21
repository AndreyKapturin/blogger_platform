import { Express } from 'express';
import { Routes } from "../../../../src/app/routes";
import { HttpStatus } from "../../../../src/core/types/HttpStatus";
import request from 'supertest';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/PostsTestManager';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createApp } from '../../../../src/app';
import { ObjectId } from 'mongodb';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
const notExistPostId = new ObjectId().toString();
let blog: ViewBlogType;


beforeAll(async () => {
  app = await createApp();
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  blog = (await blogsTestManager.createCorrectBlog()).body;
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

afterAll(async () => {
  await closeBbConnection();
});
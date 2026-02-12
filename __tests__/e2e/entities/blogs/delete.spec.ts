import { Express } from 'express';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { ObjectId } from 'mongodb';
import { createApp } from '../../../../src/app';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import request from 'supertest';
import { authHeader } from '../../../../src/core/constants';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { closeBbConnection } from '../../../../src/database/mongoDB';

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

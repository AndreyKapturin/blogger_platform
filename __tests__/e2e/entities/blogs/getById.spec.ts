import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { ISODateStringRegExp, WebsiteUrlRegExp } from '../../utils/constants';
import { closeBbConnection } from '../../../../src/database/mongoDB';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
const notExistBlogId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
});

const createExpectedBlog = (fieldName: (keyof ViewBlogType) , value: unknown) => {
  return {
    id: expect.any(String),
    name: expect.any(String),
    description: expect.any(String),
    createdAt: expect.stringMatching(ISODateStringRegExp),
    isMembership: false,
    websiteUrl: expect.any(WebsiteUrlRegExp),
    [fieldName]: value
  };
};

describe(`GET ${Routes.Blogs}/:id`, () => {
  describe(`should return ${HttpStatus.Ok} status code and blog if blog is found`, () => {
    it('blog is exist', async () => {
      const postResponse = await blogsTestManager.createCorrectBlog();
      const getResponse = await request(app).get(`${Routes.Blogs}/${postResponse.body.id}`);
      expect(getResponse.status).toBe(HttpStatus.Ok);
      expect(getResponse.body).toEqual(postResponse.body);

       const expectedBody = {
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        createdAt: expect.stringMatching(ISODateStringRegExp),
        isMembership: false,
        websiteUrl: expect.stringMatching(WebsiteUrlRegExp),
       }

      expect(postResponse.body).toEqual(expectedBody);


    });
  });

  describe(`should return ${HttpStatus.Not_Found} status code if blog not found`, () => {
    it('blog not exist', async () => {
      const getResponse = await request(app).get(`${Routes.Blogs}/${notExistBlogId}`);
      expect(getResponse.status).toBe(HttpStatus.Not_Found);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});

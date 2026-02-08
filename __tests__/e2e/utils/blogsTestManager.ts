import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import { InputBlogType, ViewBlogType } from '../../../src/entities/blogs/types';
import request, { Response } from 'supertest';
import { Express } from 'express';
import { authHeader } from '../../../src/core/constants';
import { ISODateStringRegExp } from './constants';
import { faker } from '@faker-js/faker';
import { MAX_BLOG_NAME_LENGTH } from '../../../src/entities/blogs/constants';

const correctInputBlog: InputBlogType = {
  name: 'IT-KAMASUTRA',
  description: 'Web development lessons',
  websiteUrl: 'https://it-kamasutra.io',
};

const createBlogsTestManager = (app: Express) => {
  const createCorrectBlog = async (
    changedFields: Partial<InputBlogType> = {},
    expectedFileds: Partial<InputBlogType> = {},
  ) => {
    const inputBlog: InputBlogType = {
      ...correctInputBlog,
      ...changedFields,
    };
    const expectedBlog: ViewBlogType = {
      id: expect.any(String),
      isMembership: false,
      createdAt: expect.stringMatching(ISODateStringRegExp),
      ...correctInputBlog,
      ...changedFields,
      ...expectedFileds,
    };
    const response = await request(app)
      .post(Routes.Blogs)
      .set('Authorization', authHeader)
      .send(inputBlog);

    expect(response.status).toBe(HttpStatus.Created);
    expect(response.body).toEqual(expectedBlog);
    return response;
  };

  const createManyBlogs = async (count: number): Promise<ViewBlogType[]> => {
    const inputBlogsData: InputBlogType[] = Array.from({ length: count }).map(() => {
      return {
        name: faker.lorem.word({ length: MAX_BLOG_NAME_LENGTH - 1 }),
        description: faker.lorem.words({ min: 10, max: 30 }),
        websiteUrl: faker.internet.url({ protocol: 'https' }),
      };
    });

    const createBlogResponses = await Promise.all(inputBlogsData.map(inputBlog => {
      return createCorrectBlog(inputBlog)
    }))

    return createBlogResponses.map((response) => response.body);
  };

  const createInorrectBlog = async (
    changedFields: Partial<InputBlogType> = {},
    excludedFileds: (keyof InputBlogType)[] = [],
  ) => {
    const inputBlog: InputBlogType = {
      ...correctInputBlog,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete inputBlog[key];
    }

    const response = await request(app)
      .post(Routes.Blogs)
      .set('Authorization', authHeader)
      .send(inputBlog);
    expect(response.status).toBe(HttpStatus.Bad_Request);
    expect(response.body).toEqual({
      errorsMessages: expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    });
    return response;
  };

  const correctUpdateBlog = async (
    changedFields: Partial<InputBlogType>,
    expectedFileds: Partial<InputBlogType> = {},
  ) => {
    const initialBlogResponse = await createCorrectBlog();
    const { id, ...createdBlog } = initialBlogResponse.body;
    const dataForUpdate: InputBlogType = {
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      ...changedFields,
    };

    const expectedBlog: ViewBlogType = {
      id: expect.any(String),
      isMembership: false,
      createdAt: expect.stringMatching(ISODateStringRegExp),
      ...dataForUpdate,
      ...expectedFileds,
    };

    const updateResponse = await request(app)
      .put(`${Routes.Blogs}/${id}`)
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.No_Content);

    const getResponse = await request(app).get(`${Routes.Blogs}/${id}`);
    expect(getResponse.body).toEqual(expectedBlog);
  };

  const incorrectUpdateBlog = async (
    changedFields: Partial<InputBlogType>,
    excludedFileds: (keyof InputBlogType)[] = [],
  ) => {
    const createResponse = await createCorrectBlog();
    const { id, ...createdBlog } = { ...createResponse.body };
    const dataForUpdate = {
      ...createdBlog,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete dataForUpdate[key];
    }

    const updateResponse = await request(app)
      .put(`${Routes.Blogs}/${id}`)
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.Bad_Request);

    const getResponse = await request(app).get(`${Routes.Blogs}/${id}`);
    expect(getResponse.body).toEqual(createResponse.body);
    return updateResponse;
  };

  return {
    createCorrectBlog,
    createManyBlogs,
    createInorrectBlog,
    correctUpdateBlog,
    incorrectUpdateBlog,
  };
};

export { createBlogsTestManager, correctInputBlog };
export type BlogsTestManagerType = ReturnType<typeof createBlogsTestManager>;

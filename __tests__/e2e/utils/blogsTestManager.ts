import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import { BlogType, InputBlogType } from '../../../src/entities/blogs/types';
import request from 'supertest';
import { Express } from 'express';

const correctInputBlog: InputBlogType = {
  name: 'IT-KAMASUTRA',
  description: 'Web development lessons',
  websiteUrl: 'https://it-kamasutra.io',
};

const createBlogsTestManager = (app: Express) => {
  const createCorrectBlog = async (
    changedFields: Partial<InputBlogType> = {},
    expectedFileds: Partial<InputBlogType> = {}
  ) => {
    const inputBlog: InputBlogType = {
      ...correctInputBlog,
      ...changedFields,
    };
    const expectedBlog: BlogType = {
      id: expect.any(String),
      ...correctInputBlog,
      ...changedFields,
      ...expectedFileds,
    };
    const response = await request(app).post(Routes.Blogs).send(inputBlog);
    expect(response.status).toBe(HttpStatus.Created);
    expect(response.body).toEqual(expectedBlog);
    return response;
  };

  const createInorrectBlog = async (
    changedFields: Partial<InputBlogType> = {},
    excludedFileds: (keyof InputBlogType)[] = []
  ) => {
    const inputBlog: InputBlogType = {
      ...correctInputBlog,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete inputBlog[key];
    }

    const response = await request(app).post(Routes.Blogs).send(inputBlog);
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
    expectedFileds: Partial<InputBlogType> = {}
  ) => {
    const createResponse = await createCorrectBlog();
    const { id, ...createdBlog } = { ...createResponse.body };
    const dataForUpdate = {
      ...createdBlog,
      ...changedFields,
    };

    const expectedBlog: BlogType = {
      id: expect.any(String),
      ...dataForUpdate,
      ...expectedFileds,
    };

    const updateResponse = await request(app).put(`${Routes.Blogs}/${id}`).send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.No_Content);
    const getResponse = await request(app).get(`${Routes.Blogs}/${id}`);

    expect(getResponse.body).toEqual(expectedBlog);
  };

  const incorrectUpdateBlog = async (
    changedFields: Partial<InputBlogType>,
    excludedFileds: (keyof InputBlogType)[] = []
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

    const updateResponse = await request(app).put(`${Routes.Blogs}/${id}`).send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.Bad_Request);
    const getResponse = await request(app).get(`${Routes.Blogs}/${id}`);
    expect(getResponse.body).toEqual(createResponse.body);
    return updateResponse;
  };

  return {
    createCorrectBlog,
    createInorrectBlog,
    correctUpdateBlog,
    incorrectUpdateBlog,
  };
};

export { createBlogsTestManager, correctInputBlog };

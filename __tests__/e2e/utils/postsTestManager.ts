import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import { ViewBlogType } from '../../../src/entities/blogs/types';
import request from 'supertest';
import { Express } from 'express';
import { InputPostType, ViewPostType } from '../../../src/entities/posts/types';
import { authHeader } from '../../../src/core/constants';
import { ISODateStringRegExp } from './constants';

const correctInputPostData: Partial<InputPostType> = {
  title: 'How create node js app?',
  content: 'p'.repeat(100),
  shortDescription: 'p'.repeat(50),
};

const createPostsTestManager = (app: Express) => {
  const createCorrectPost = async (
    blog: ViewBlogType,
    changedFields: Partial<InputPostType> = {},
    expectedFileds: Partial<ViewPostType> = {}
  ) => {
    const inputPost = {
      ...correctInputPostData,
      blogId: blog.id,
      ...changedFields,
    };
    const expectedPost = {
      id: expect.any(String),
      ...inputPost,
      blogName: blog.name,
      createdAt: expect.stringMatching(ISODateStringRegExp),
      ...changedFields,
      ...expectedFileds,
    };
    const response = await request(app)
      .post(Routes.Posts)
      .set('Authorization', authHeader)
      .send(inputPost);
    expect(response.status).toBe(HttpStatus.Created);
    expect(response.body).toEqual(expectedPost);
    return response;
  };

  const createInorrectPost = async (
    changedFields: Partial<InputPostType> = {},
    excludedFileds: (keyof InputPostType)[] = []
  ) => {
    const inputPost = {
      ...correctInputPostData,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete inputPost[key];
    }

    const response = await request(app)
      .post(Routes.Posts)
      .set('Authorization', authHeader)
      .send(inputPost);
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

  const correctUpdatePost = async (
    blog: ViewBlogType,
    changedFields: Partial<InputPostType>,
    expectedFileds: Partial<ViewPostType> = {}
  ) => {
    const createResponse = await createCorrectPost(blog);
    const { id, blogName, ...createdPost } = { ...createResponse.body };
    const dataForUpdate = {
      ...createdPost,
      ...changedFields,
    };

    const expectedPost: ViewPostType = {
      id: expect.any(String),
      blogName,
      createdAt: expect.stringMatching(ISODateStringRegExp),
      ...dataForUpdate,
      ...expectedFileds,
    };

    const updateResponse = await request(app)
      .put(`${Routes.Posts}/${id}`)
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.No_Content);

    const getResponse = await request(app).get(`${Routes.Posts}/${id}`);
    expect(getResponse.body).toEqual(expectedPost);
  };

  const incorrectUpdatePost = async (
    blog: ViewBlogType,
    changedFields: Partial<InputPostType>,
    excludedFileds: (keyof InputPostType)[] = []
  ) => {
    const createResponse = await createCorrectPost(blog);
    const { id, ...createdPost } = { ...createResponse.body };
    const dataForUpdate = {
      ...createdPost,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete dataForUpdate[key];
    }

    const updateResponse = await request(app)
      .put(`${Routes.Posts}/${id}`)
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.Bad_Request);
    const getResponse = await request(app).get(`${Routes.Posts}/${id}`);
    expect(getResponse.body).toEqual(createResponse.body);
    return updateResponse;
  };

  return {
    createCorrectPost,
    createInorrectPost,
    correctUpdatePost,
    incorrectUpdatePost,
  };
};

export { createPostsTestManager, correctInputPostData };
export type PostsTestManagerType = ReturnType<typeof createPostsTestManager>;

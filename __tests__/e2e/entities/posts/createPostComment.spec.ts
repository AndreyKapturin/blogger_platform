import { Express } from 'express';
import { createApp } from '../../../../src/app';
import { Routes } from '../../../../src/app/routes';
import { ViewPostType } from '../../../../src/entities/posts/types';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { createBlogsTestManager, BlogsTestManagerType } from '../../utils/blogsTestManager';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createUsersTestManager, UsersTestManagerType } from '../../utils/usersTestManager';
import { ViewUserType } from '../../../../src/entities/users/types';
import { ISODateStringRegExp } from '../../utils/constants';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { MIN_COMMENT_CONTENT_LENGTH } from '../../../../src/entities/comments/constants';
import { ObjectId } from 'mongodb';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let usersTestManager: UsersTestManagerType;
let blog: ViewBlogType;
let post: ViewPostType;
let user: ViewUserType;
let userAccessToken: string;
let userPassword = 'Qwerty123!@#';

const validCommentContent = 'Very cool post. I like it!';
const notExistPostId = new ObjectId().toString();
const invalidAccessToken = 'jdlnfjlkadn fjl;adnfl;kn adlksnf jlasdnfjlknadlsknlfjad';

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);

  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  usersTestManager = createUsersTestManager(app);

  blog = (await blogsTestManager.createCorrectBlog()).body;
  post = (await postsTestManager.createCorrectPost(blog)).body;
  user = await usersTestManager.createUser({ password: userPassword });
  userAccessToken = (
    await request(app).post(`${Routes.Auth}/login`).send({
      loginOrEmail: user.login,
      password: userPassword,
    })
  ).body.accessToken;
});

describe(`POST ${Routes.Posts}/:id/comments`, () => {
  it(`should create comment, return ${HttpStatus.Created} status code
    and created comment if data is valid and comment exist`, async () => {
    const createCommentResponse = await request(app)
      .post(`${Routes.Posts}/${post.id}/comments`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        content: validCommentContent,
      });

    expect(createCommentResponse.status).toBe(HttpStatus.Created);
    expect(createCommentResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        content: validCommentContent,
        commentatorInfo: {
          userId: user.id,
          userLogin: user.login,
        },
        createdAt: expect.stringMatching(ISODateStringRegExp),
      }),
    );
  });

  it(`should return ${HttpStatus.Bad_Request} if data is invalid`, async () => {
    const createCommentResponse = await request(app)
      .post(`${Routes.Posts}/${post.id}/comments`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        content: 'p'.repeat(MIN_COMMENT_CONTENT_LENGTH - 1),
      });

    expect(createCommentResponse.status).toBe(HttpStatus.Bad_Request);
    expect(createCommentResponse.body.errorsMessages).toEqual([
      {
        field: 'content',
        message: expect.any(String),
      },
    ]);
  });

  it(`should return ${HttpStatus.Unauthorized} if access token invalid`, async () => {
    const createCommentResponse = await request(app)
      .post(`${Routes.Posts}/${post.id}/comments`)
      .set('Authorization', `Bearer ${invalidAccessToken}`)
      .send({
        content: 'p'.repeat(MIN_COMMENT_CONTENT_LENGTH - 1),
      });

    expect(createCommentResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Not_Found} if post not exist`, async () => {
    const createCommentResponse = await request(app)
      .post(`${Routes.Posts}/${notExistPostId}/comments`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        content: validCommentContent,
      });

    expect(createCommentResponse.status).toBe(HttpStatus.Not_Found);
    expect(createCommentResponse.body.errorsMessages).toEqual([
      {
        field: null,
        message: expect.any(String),
      },
    ]);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

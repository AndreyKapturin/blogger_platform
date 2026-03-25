import { Express } from 'express';
import { createApp } from '../../../../src/app';
import { Routes } from '../../../../src/app/routes';
import { ViewPostType } from '../../../../src/entities/posts/types';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { createBlogsTestManager, BlogsTestManagerType } from '../../utils/blogsTestManager';
import { expectedViewComment } from '../../utils/commentsTestManager';
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
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);

  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  usersTestManager = createUsersTestManager(app);

  blog = (await blogsTestManager.createCorrectBlog()).body;
  post = (await postsTestManager.createCorrectPost(blog)).body;
  user = (await usersTestManager.createUser({ password: userPassword })).created;
  userAccessToken = await usersTestManager.loginUser(user.login, userPassword);
});

describe(`POST ${Routes.PostCommentsById(':id')}`, () => {
  it(`should create comment, return ${HttpStatus.Created} status code
    and created comment if data is valid and comment exist`, async () => {
    const createCommentResponse = await request(app)
      .post(Routes.PostCommentsById(post.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        content: validCommentContent,
      });
      
    expect(createCommentResponse.status).toBe(HttpStatus.Created);
    expect(createCommentResponse.body).toEqual({
      ...expectedViewComment,
      content: validCommentContent,
    });
  });

  it(`should return ${HttpStatus.Bad_Request} if data is invalid`, async () => {
    const createCommentResponse = await request(app)
      .post(Routes.PostCommentsById(post.id))
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
      .post(Routes.PostCommentsById(post.id))
      .set('Authorization', `Bearer ${invalidAccessToken}`)
      .send({ content: validCommentContent });
    expect(createCommentResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Not_Found} if post not exist`, async () => {
    const createCommentResponse = await request(app)
      .post(Routes.PostCommentsById(notExistPostId))
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

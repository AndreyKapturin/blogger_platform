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
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { ObjectId } from 'mongodb';
import {
  CommentsTestManagerType,
  createCommentsTestManager,
} from '../../utils/commentsTestManager';
import { ViewCommentType } from '../../../../src/entities/comments/types';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let usersTestManager: UsersTestManagerType;
let commentsTestManager: CommentsTestManagerType;

let blog: ViewBlogType;
let post: ViewPostType;
let user: ViewUserType;
let anotherUser: ViewUserType;
let comment: ViewCommentType;
let userAccessToken: string;
let anotherUserAccessToken: string;
let userPassword = 'Qwerty123!@#';

const validCommentContent = 'Updated comment text! Very cool post. I like it!';
const notExistCommentId = new ObjectId().toString();
const invalidAccessToken = 'jdlnfjlkadn fjl;adnfl;kn adlksnf jlasdnfjlknadlsknlfjad';

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);

  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  usersTestManager = createUsersTestManager(app);
  commentsTestManager = createCommentsTestManager(app);

  blog = (await blogsTestManager.createCorrectBlog()).body;
  post = (await postsTestManager.createCorrectPost(blog)).body;
  user = (await usersTestManager.createUser({ password: userPassword })).created;
  anotherUser = (await usersTestManager.createUser({ password: userPassword })).created;
  userAccessToken = await usersTestManager.loginUser(user.login, userPassword);
  anotherUserAccessToken = await usersTestManager.loginUser(anotherUser.login, userPassword);
  comment = await commentsTestManager.createComment(post.id, userAccessToken);
});

describe(`PUT ${Routes.Comments}/:id`, () => {
  it(`should update comment, return ${HttpStatus.No_Content} status code
    if data is valid and comment exist`, async () => {
    const updateCommentResponse = await request(app)
      .put(`${Routes.Comments}/${comment.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ content: validCommentContent });
    expect(updateCommentResponse.status).toBe(HttpStatus.No_Content);
  });

  it(`should return ${HttpStatus.Bad_Request} status code if data invalid`, async () => {
    const updateCommentResponse = await request(app)
      .put(`${Routes.Comments}/${comment.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ content: 'short' });
    expect(updateCommentResponse.status).toBe(HttpStatus.Bad_Request);
    expect(updateCommentResponse.body.errorsMessages).toEqual([
      {
        field: 'content',
        message: expect.any(String),
      },
    ]);
  });

  it(`should return ${HttpStatus.Unauthorized} if access token invalid`, async () => {
    const updateCommentResponse = await request(app)
      .put(`${Routes.Comments}/${comment.id}`)
      .set('Authorization', `Bearer ${invalidAccessToken}`)
      .send({ content: validCommentContent });
    expect(updateCommentResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Forbidden} if user is not comment author`, async () => {
    const updateCommentResponse = await request(app)
      .put(`${Routes.Comments}/${comment.id}`)
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({ content: validCommentContent });
    expect(updateCommentResponse.status).toBe(HttpStatus.Forbidden);
  });

  it(`should return ${HttpStatus.Not_Found} if comment not exist`, async () => {
    const updateCommentResponse = await request(app)
      .put(`${Routes.Comments}/${notExistCommentId}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ content: validCommentContent });
    expect(updateCommentResponse.status).toBe(HttpStatus.Not_Found);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

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
let comment: ViewCommentType;
let userAccessToken: string;
let userPassword = 'Qwerty123!@#';

const notExistCommentId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);

  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  usersTestManager = createUsersTestManager(app);
  commentsTestManager = createCommentsTestManager(app);

  blog = (await blogsTestManager.createCorrectBlog()).body;
  post = (await postsTestManager.createCorrectPost(blog)).body;
  user = (await usersTestManager.createUser({ password: userPassword })).created;
  userAccessToken = await usersTestManager.loginUser(user.login, userPassword);
  comment = await commentsTestManager.createComment(post.id, userAccessToken);
});

describe(`GET ${Routes.CommentById(':id')}`, () => {
  it(`should return ${HttpStatus.Ok} status code and comment if comment exist`, async () => {
    const response = await request(app).get(Routes.CommentById(comment.id));
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(comment);
  });

  it(`should return ${HttpStatus.Not_Found} if comment not exist`, async () => {
    const response = await request(app).get(Routes.CommentById(notExistCommentId));
    expect(response.status).toBe(HttpStatus.Not_Found);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

import { Express, request as expressRequest } from 'express';
import { createApp } from '../../../../src/app';
import { Routes } from '../../../../src/app/routes';
import { ViewPostType } from '../../../../src/entities/posts/types';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { createBlogsTestManager, BlogsTestManagerType } from '../../utils/blogsTestManager';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import {
  createUsersTestManager,
  UsersTestManagerType,
  UserWithToken,
} from '../../utils/usersTestManager';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { ObjectId } from 'mongodb';
import { ViewCommentType } from '../../../../src/entities/comments/types';
import {
  CommentsTestManagerType,
  createCommentsTestManager,
  expectedPaginatedViewComments,
} from '../../utils/commentsTestManager';
import { faker } from '@faker-js/faker';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let usersTestManager: UsersTestManagerType;
let commentsTestManager: CommentsTestManagerType;
let blog: ViewBlogType;
let posts: ViewPostType[];
let usersWithTokens: UserWithToken[];
let comments: ViewCommentType[];

const notExistPostId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);

  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  usersTestManager = createUsersTestManager(app);
  commentsTestManager = createCommentsTestManager(app);

  blog = (await blogsTestManager.createCorrectBlog()).body;
  posts = await postsTestManager.createManyPosts(blog, 10);
  usersWithTokens = await usersTestManager.createManyUsersAndLogin(5);
  comments = await commentsTestManager.createManyComments(
    100,
    posts.map(({ id }) => id),
    usersWithTokens.map(({ accessToken }) => accessToken),
  );
});

beforeEach(() => {
  jest.spyOn(expressRequest, 'ip', 'get').mockReturnValue(faker.internet.ipv4());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe(`GET ${Routes.PostCommentsById(':id')}`, () => {
  it(`should return ${HttpStatus.Ok} and paginated comments if post exist`, async () => {
    const response = await request(app).get(Routes.PostCommentsById(posts[0].id));
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedPaginatedViewComments);
  });

  it(`should return ${HttpStatus.Not_Found} if post not exist`, async () => {
    const response = await request(app).get(Routes.PostCommentsById(notExistPostId));
    expect(response.status).toBe(HttpStatus.Not_Found);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

import { Express, request as expressRequest } from 'express';
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
import { LikeStatus, ViewCommentType } from '../../../../src/entities/comments/types';
import { faker } from '@faker-js/faker';

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
  anotherUser = (await usersTestManager.createUser({ password: userPassword })).created;
  userAccessToken = await usersTestManager.loginUser(user.login, userPassword);
  anotherUserAccessToken = await usersTestManager.loginUser(anotherUser.login, userPassword);
});

beforeEach(async () => {
  comment = await commentsTestManager.createComment(post.id, userAccessToken);
  jest.spyOn(expressRequest, 'ip', 'get').mockReturnValue(faker.internet.ipv4());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe(`PUT ${Routes.CommentLikeStatus(':id')}`, () => {
  it(`should add like, return ${HttpStatus.No_Content} status code`, async () => {
    const user1LikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(user1LikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterLikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(getCommentAfterLikeRespone.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
    });

    const user2LikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(user2LikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterAnotherUserLikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);

    expect(getCommentAfterAnotherUserLikeRespone.body.likesInfo).toEqual({
      likesCount: 2,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
    });
  });

  it(`should add dislike, return ${HttpStatus.No_Content} status code`, async () => {
    const user1DislikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    expect(user1DislikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterDislikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(getCommentAfterDislikeRespone.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: LikeStatus.Dislike,
    });

    const user2DislikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    expect(user2DislikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterAnotherUserDislikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);

    expect(getCommentAfterAnotherUserDislikeRespone.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 2,
      myStatus: LikeStatus.Dislike,
    });
  });

  it(`should not twice add like, return ${HttpStatus.No_Content} status code`, async () => {
    const firstLikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(firstLikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const secondLikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(secondLikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterLikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(getCommentAfterLikeRespone.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
    });
  });

  it(`should change status, return ${HttpStatus.No_Content} status code`, async () => {
    const likeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(likeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterLikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(getCommentAfterLikeRespone.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
    });

    const dislikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    expect(dislikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterDislikeRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(getCommentAfterDislikeRespone.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: LikeStatus.Dislike,
    });

    const noneCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.None });

    expect(noneCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterNoneRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`);

    expect(getCommentAfterNoneRespone.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    });
  });

  it(`should return ${HttpStatus.Bad_Request} status code if likeStatus incorrect`, async () => {
    const likeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: 'abracadabra' });

    expect(likeCommentResponse.status).toBe(HttpStatus.Bad_Request);
  });

  it(`should return ${HttpStatus.Not_Found} status code if comment not exist`, async () => {
    const likeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(notExistCommentId))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(likeCommentResponse.status).toBe(HttpStatus.Not_Found);
  });
});

describe(`GET ${Routes.CommentById(':id')}`, () => {
  it(`should return myStatus: "${LikeStatus.None}" if another user liked comment`, async () => {
    const user1LikeCommentResponse = await request(app)
      .put(Routes.CommentLikeStatus(comment.id))
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(user1LikeCommentResponse.status).toBe(HttpStatus.No_Content);

    const getCommentAfterLikeForAnotherUserRespone = await request(app)
      .get(Routes.CommentById(comment.id))
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);

    expect(getCommentAfterLikeForAnotherUserRespone.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    });
  });
});

describe(`GET ${Routes.PostCommentsById(':id')}`, () => {
  it(`should return ${HttpStatus.Ok} and paginated comments`, async () => {
    await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
    blog = (await blogsTestManager.createCorrectBlog()).body;
    post = (await postsTestManager.createCorrectPost(blog)).body;

    const users = await usersTestManager.createManyUsersAndLogin(5);
    const user1AccessToken = users[0].accessToken;
    const user2AccessToken = users[1].accessToken;
    const user3AccessToken = users[2].accessToken;
    const user4AccessToken = users[3].accessToken;
    const user5AccessToken = users[4].accessToken;

    const comment1User = await commentsTestManager.createComment(
      post.id,
      user1AccessToken,
      'User 1 correct comment',
    );
    const comment2User = await commentsTestManager.createComment(
      post.id,
      user2AccessToken,
      'User 1 correct comment',
    );
    const comment3User = await commentsTestManager.createComment(
      post.id,
      user3AccessToken,
      'User 1 correct comment',
    );
    
    await request(app)
      .put(Routes.CommentLikeStatus(comment1User.id))
      .set('Authorization', `Bearer ${user2AccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.CommentLikeStatus(comment1User.id))
      .set('Authorization', `Bearer ${user3AccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.CommentLikeStatus(comment1User.id))
      .set('Authorization', `Bearer ${user4AccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.CommentLikeStatus(comment2User.id))
      .set('Authorization', `Bearer ${user1AccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.CommentLikeStatus(comment2User.id))
      .set('Authorization', `Bearer ${user5AccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.CommentLikeStatus(comment2User.id))
      .set('Authorization', `Bearer ${user4AccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.CommentLikeStatus(comment2User.id))
      .set('Authorization', `Bearer ${user3AccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.CommentLikeStatus(comment3User.id))
      .set('Authorization', `Bearer ${user1AccessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.CommentLikeStatus(comment3User.id))
      .set('Authorization', `Bearer ${user2AccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.CommentLikeStatus(comment3User.id))
      .set('Authorization', `Bearer ${user2AccessToken}`)
      .send({ likeStatus: LikeStatus.None });

    await request(app)
      .put(Routes.CommentLikeStatus(comment3User.id))
      .set('Authorization', `Bearer ${user4AccessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const getPostCommentsForUser1 = await request(app)
      .get(Routes.PostCommentsById(post.id))
      .set('Authorization', `Bearer ${user1AccessToken}`);

    expect(getPostCommentsForUser1.status).toBe(HttpStatus.Ok);
    expect(getPostCommentsForUser1.body.totalCount).toBe(3);
    expect(getPostCommentsForUser1.body.items).toEqual([
      expect.objectContaining({
        content: comment3User.content,
        likesInfo: {
          likesCount: 1,
          dislikesCount: 1,
          myStatus: LikeStatus.Dislike,
        },
      }),
      expect.objectContaining({
        content: comment2User.content,
        likesInfo: {
          likesCount: 1,
          dislikesCount: 3,
          myStatus: LikeStatus.Like,
        },
      }),
      expect.objectContaining({
        content: comment1User.content,
        likesInfo: {
          likesCount: 2,
          dislikesCount: 1,
          myStatus: LikeStatus.None,
        },
      }),
    ]);

    const getPostCommentsForUser3 = await request(app)
      .get(Routes.PostCommentsById(post.id))
      .set('Authorization', `Bearer ${user3AccessToken}`);

    expect(getPostCommentsForUser3.status).toBe(HttpStatus.Ok);
    expect(getPostCommentsForUser3.body.totalCount).toBe(3);
    expect(getPostCommentsForUser3.body.items).toEqual([
      expect.objectContaining({
        content: comment3User.content,
        likesInfo: {
          likesCount: 1,
          dislikesCount: 1,
          myStatus: LikeStatus.None,
        },
      }),
      expect.objectContaining({
        content: comment2User.content,
        likesInfo: {
          likesCount: 1,
          dislikesCount: 3,
          myStatus: LikeStatus.Dislike,
        },
      }),
      expect.objectContaining({
        content: comment1User.content,
        likesInfo: {
          likesCount: 2,
          dislikesCount: 1,
          myStatus: LikeStatus.Like,
        },
      }),
    ]);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

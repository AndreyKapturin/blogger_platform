import { Express, request as expressRequest } from 'express';
import { createApp } from '../../../../src/app';
import { Routes } from '../../../../src/app/routes';
import { ExtendedLikesInfo } from '../../../../src/entities/posts/types';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { createBlogsTestManager, BlogsTestManagerType } from '../../utils/blogsTestManager';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createUsersTestManager, UsersTestManagerType } from '../../utils/usersTestManager';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../../../src/entities/comments/types';
import { faker } from '@faker-js/faker';
import { ISODateStringRegExp } from '../../utils/constants';

let app: Express;
let blogsTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let usersTestManager: UsersTestManagerType;

let blog: ViewBlogType;

const notExistCommentId = new ObjectId().toString();

beforeAll(async () => {
  app = await createApp();
  blogsTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  usersTestManager = createUsersTestManager(app);
});

beforeEach(async () => {
  jest.spyOn(expressRequest, 'ip', 'get').mockReturnValue(faker.internet.ipv4());
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  blog = (await blogsTestManager.createCorrectBlog()).body;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe(`PUT ${Routes.PostLikeStatus(':id')}`, () => {
  it(`should add like, return ${HttpStatus.No_Content} status code`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const [{ user, accessToken }] = await usersTestManager.createManyUsersAndLogin(1);

    const likeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(likeResponse.status).toBe(HttpStatus.No_Content);

    const getPostAfterLike = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${accessToken}`);

    const expectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 1,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user.login,
          userId: user.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.Like,
    };

    expect(getPostAfterLike.status).toBe(HttpStatus.Ok);
    expect(getPostAfterLike.body.extendedLikesInfo).toEqual(expectedLikesInfo);
  });

  it(`should add dislike, return ${HttpStatus.No_Content} status code`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const [{ accessToken }] = await usersTestManager.createManyUsersAndLogin(1);

    const dislikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    expect(dislikeResponse.status).toBe(HttpStatus.No_Content);

    const getPostAfterDislike = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${accessToken}`);

    const expectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 1,
      newestLikes: [],
      myStatus: LikeStatus.Dislike,
    };

    expect(getPostAfterDislike.status).toBe(HttpStatus.Ok);
    expect(getPostAfterDislike.body.extendedLikesInfo).toEqual(expectedLikesInfo);
  });

  it(`should not twice add like, return ${HttpStatus.No_Content} status code`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const [{ user, accessToken }] = await usersTestManager.createManyUsersAndLogin(1);

    const firstLikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(firstLikeResponse.status).toBe(HttpStatus.No_Content);

    const secondLikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(secondLikeResponse.status).toBe(HttpStatus.No_Content);

    const getPostAfterLikeRespone = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getPostAfterLikeRespone.status).toBe(HttpStatus.Ok);

    const expectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 1,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user.login,
          userId: user.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.Like,
    };

    expect(getPostAfterLikeRespone.body.extendedLikesInfo).toEqual(expectedLikesInfo);
  });

  it(`should change status, return ${HttpStatus.No_Content} status code`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const [{ user, accessToken }] = await usersTestManager.createManyUsersAndLogin(1);

    const likeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(likeResponse.status).toBe(HttpStatus.No_Content);

    const getPostAfterLikeResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${accessToken}`);

    const expectedAfterLikeLikesInfo: ExtendedLikesInfo = {
      likesCount: 1,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user.login,
          userId: user.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.Like,
    };

    expect(getPostAfterLikeResponse.body.extendedLikesInfo).toEqual(expectedAfterLikeLikesInfo);

    const dislikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    expect(dislikeResponse.status).toBe(HttpStatus.No_Content);

    const getPostAfterDislikeResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${accessToken}`);

    const expectedAfterDislikeLikesInfo: ExtendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 1,
      newestLikes: [],
      myStatus: LikeStatus.Dislike,
    };

    expect(getPostAfterDislikeResponse.body.extendedLikesInfo).toEqual(
      expectedAfterDislikeLikesInfo,
    );

    const noneResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.None });

    expect(noneResponse.status).toBe(HttpStatus.No_Content);

    const getPostAfterNoneResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${accessToken}`);

    const expectedAfterNoneLikesInfo: ExtendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
      myStatus: LikeStatus.None,
    };

    expect(getPostAfterNoneResponse.body.extendedLikesInfo).toEqual(expectedAfterNoneLikesInfo);
  });

  it(`should return ${HttpStatus.Bad_Request} status code if likeStatus incorrect`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const [{ accessToken }] = await usersTestManager.createManyUsersAndLogin(1);

    const likeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: 'abracadabra' });

    expect(likeResponse.status).toBe(HttpStatus.Bad_Request);
  });

  it(`should return ${HttpStatus.Not_Found} status code if comment not exist`, async () => {
    const [{ accessToken }] = await usersTestManager.createManyUsersAndLogin(1);

    const likeCommentResponse = await request(app)
      .put(Routes.PostLikeStatus(notExistCommentId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    expect(likeCommentResponse.status).toBe(HttpStatus.Not_Found);
  });
});

describe(`GET ${Routes.PostById(':id')}`, () => {
  it(`should return myStatus: "${LikeStatus.None}" if another user liked post`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const users = await usersTestManager.createManyUsersAndLogin(2);
    const user1 = users[0].user;
    const user1accessToken = users[0].accessToken;
    const user2accessToken = users[1].accessToken;

    const user1LikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const getPostAfterLikeForAnotherUserResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${user2accessToken}`);

    const expectedAfterLikeLikesInfo: ExtendedLikesInfo = {
      likesCount: 1,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user1.login,
          userId: user1.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.None,
    };

    expect(getPostAfterLikeForAnotherUserResponse.body.extendedLikesInfo).toEqual(
      expectedAfterLikeLikesInfo,
    );
  });

  it(`like shouldn't become newest if you remove it and put back`, async () => {
    const createPostResponse = await postsTestManager.createCorrectPost(blog);
    const postId = createPostResponse.body.id;

    const users = await usersTestManager.createManyUsersAndLogin(5);
    const user1 = users[0].user;
    const user2 = users[1].user;
    const user3 = users[2].user;
    const user4 = users[3].user;
    const user5 = users[4].user;
    const user1accessToken = users[0].accessToken;
    const user2accessToken = users[1].accessToken;
    const user3accessToken = users[2].accessToken;
    const user4accessToken = users[3].accessToken;
    const user5accessToken = users[4].accessToken;

    const user1LikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const user2LikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user2accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const user3LikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user3accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const getPostAfter3UserLikeResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${user1accessToken}`);

    const after3UserLikesExpectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 3,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user3.login,
          userId: user3.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user2.login,
          userId: user2.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user1.login,
          userId: user1.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.Like,
    };

    expect(getPostAfter3UserLikeResponse.body.extendedLikesInfo).toEqual(
      after3UserLikesExpectedLikesInfo,
    );

    const user4LikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user4accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const user5LikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user5accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const getPostAfterMore2UserLikeResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${user1accessToken}`);

    const afterMore2UserLikesExpectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 5,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user5.login,
          userId: user5.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user4.login,
          userId: user4.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user3.login,
          userId: user3.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.Like,
    };

    expect(getPostAfterMore2UserLikeResponse.body.extendedLikesInfo).toEqual(
      afterMore2UserLikesExpectedLikesInfo,
    );

    const user1UnlikeResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.None });

    const getPostAfterUser1UnlikeResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${user1accessToken}`);

    const afterUser1UnlikeExpectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 4,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user5.login,
          userId: user5.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user4.login,
          userId: user4.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user3.login,
          userId: user3.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.None,
    };

    expect(getPostAfterUser1UnlikeResponse.body.extendedLikesInfo).toEqual(
      afterUser1UnlikeExpectedLikesInfo,
    );

    const user1LlikeAgainResponse = await request(app)
      .put(Routes.PostLikeStatus(postId))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const getPostAfterUser1LikeAgainResponse = await request(app)
      .get(Routes.PostById(postId))
      .set('Authorization', `Bearer ${user1accessToken}`);

    const afterUser1LikeAgainExpectedLikesInfo: ExtendedLikesInfo = {
      likesCount: 5,
      dislikesCount: 0,
      newestLikes: [
        {
          login: user5.login,
          userId: user5.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user4.login,
          userId: user4.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
        {
          login: user3.login,
          userId: user3.id,
          addedAt: expect.stringMatching(ISODateStringRegExp),
        },
      ],
      myStatus: LikeStatus.Like,
    };

    expect(getPostAfterUser1LikeAgainResponse.body.extendedLikesInfo).toEqual(
      afterUser1LikeAgainExpectedLikesInfo,
    );
  });
});

describe.each([Routes.Posts, Routes.BlogPostsById(':id')])('GET %s', (url) => {
  it(`should return ${HttpStatus.Ok} and paginated posts`, async () => {
    const getPostsUrl = url.includes(':id') ? url.replace(':id', blog.id) : url;

    const createPost1Response = await postsTestManager.createCorrectPost(blog, {
      title: 'Post 1 title',
    });
    const createPost2Response = await postsTestManager.createCorrectPost(blog, {
      title: 'Post 2 title',
    });
    const createPost3Response = await postsTestManager.createCorrectPost(blog, {
      title: 'Post 3 title',
    });

    const post1Id = createPost1Response.body.id;
    const post2Id = createPost2Response.body.id;
    const post3Id = createPost3Response.body.id;

    const users = await usersTestManager.createManyUsersAndLogin(5);
    const user1 = users[0].user;
    const user2 = users[1].user;
    const user3 = users[2].user;
    const user4 = users[3].user;
    const user5 = users[4].user;
    const user1accessToken = users[0].accessToken;
    const user2accessToken = users[1].accessToken;
    const user3accessToken = users[2].accessToken;
    const user4accessToken = users[3].accessToken;
    const user5accessToken = users[4].accessToken;

    await request(app)
      .put(Routes.PostLikeStatus(post1Id))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post1Id))
      .set('Authorization', `Bearer ${user3accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post1Id))
      .set('Authorization', `Bearer ${user4accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.PostLikeStatus(post1Id))
      .set('Authorization', `Bearer ${user5accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post2Id))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.PostLikeStatus(post2Id))
      .set('Authorization', `Bearer ${user3accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post2Id))
      .set('Authorization', `Bearer ${user3accessToken}`)
      .send({ likeStatus: LikeStatus.None });

    await request(app)
      .put(Routes.PostLikeStatus(post2Id))
      .set('Authorization', `Bearer ${user2accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post2Id))
      .set('Authorization', `Bearer ${user5accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.PostLikeStatus(post3Id))
      .set('Authorization', `Bearer ${user5accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.PostLikeStatus(post3Id))
      .set('Authorization', `Bearer ${user4accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post3Id))
      .set('Authorization', `Bearer ${user3accessToken}`)
      .send({ likeStatus: LikeStatus.None });

    await request(app)
      .put(Routes.PostLikeStatus(post3Id))
      .set('Authorization', `Bearer ${user2accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    await request(app)
      .put(Routes.PostLikeStatus(post3Id))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Dislike });

    await request(app)
      .put(Routes.PostLikeStatus(post3Id))
      .set('Authorization', `Bearer ${user1accessToken}`)
      .send({ likeStatus: LikeStatus.Like });

    const getPostsAfterLikesForUser1Response = await request(app)
      .get(getPostsUrl)
      .set('Authorization', `Bearer ${user1accessToken}`);

    expect(getPostsAfterLikesForUser1Response.body.items).toEqual([
      expect.objectContaining({
        title: 'Post 3 title',
        extendedLikesInfo: {
          likesCount: 3,
          dislikesCount: 1,
          newestLikes: [
            {
              login: user1.login,
              userId: user1.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
            {
              login: user2.login,
              userId: user2.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
            {
              login: user4.login,
              userId: user4.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
          ],
          myStatus: LikeStatus.Like,
        },
      }),
      expect.objectContaining({
        title: 'Post 2 title',
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 2,
          newestLikes: [
            {
              login: user2.login,
              userId: user2.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
          ],
          myStatus: LikeStatus.Dislike,
        },
      }),
      expect.objectContaining({
        title: 'Post 1 title',
        extendedLikesInfo: {
          likesCount: 3,
          dislikesCount: 1,
          newestLikes: [
            {
              login: user5.login,
              userId: user5.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
            {
              login: user3.login,
              userId: user3.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
            {
              login: user1.login,
              userId: user1.id,
              addedAt: expect.stringMatching(ISODateStringRegExp),
            },
          ],
          myStatus: LikeStatus.Like,
        },
      }),
    ]);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

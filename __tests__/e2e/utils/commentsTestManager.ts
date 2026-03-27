import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import request from 'supertest';
import { Express } from 'express';
import { faker } from '@faker-js/faker';
import {
  InputCommentType,
  ViewCommentType,
} from '../../../src/entities/comments/types';
import { getRandomIntInRange } from '../../../src/core/utils/numbers/numberUtils';
import { Paginator } from '../../../src/core/types/PaginationAndSorting';
import { ISODateStringRegExp } from './constants';
import { likeStatusesRegExp } from '../../../src/core/constants';

const expectedViewComment: ViewCommentType = {
  id: expect.any(String),
  content: expect.any(String),
  createdAt: expect.stringMatching(ISODateStringRegExp),
  commentatorInfo: {
    userId: expect.any(String),
    userLogin: expect.any(String),
  },
  likesInfo: {
    likesCount: expect.any(Number),
    dislikesCount: expect.any(Number),
    myStatus: expect.stringMatching(likeStatusesRegExp),
  },
};

const expectedPaginatedViewComments: Paginator<ViewCommentType> = {
  page: expect.any(Number),
  pagesCount: expect.any(Number),
  pageSize: expect.any(Number),
  totalCount: expect.any(Number),
  items: expect.arrayContaining([expectedViewComment]),
};

const createCommentsTestManager = (app: Express) => {
  const createComment = async (
    postId: string,
    accessToken: string,
    content?: string,
  ): Promise<ViewCommentType> => {
    const inputComment: InputCommentType = {
      content: content ?? faker.lorem.sentence({ min: 5, max: 10 }),
    };

    const response = await request(app)
      .post(Routes.PostCommentsById(postId))
      .set('Authorization', `Bearer ${accessToken}`)
      .send(inputComment);

    expect(response.status).toBe(HttpStatus.Created);
    return response.body;
  };

  const createManyComments = async (count: number, postIds: string[], accessTokens: string[]) => {
    const createCommentRequests: Promise<ViewCommentType>[] = [];
    const lastPostIdsIndex = postIds.length - 1;
    const lastAccessTokenIndex = accessTokens.length - 1;

    for (let i = 0; i < count; i++) {
      const randomPostId = getRandomIntInRange(0, lastPostIdsIndex);
      const randomAccessToken = getRandomIntInRange(0, lastAccessTokenIndex);
      createCommentRequests.push(
        createComment(postIds[randomPostId], accessTokens[randomAccessToken]),
      );
    }
    return Promise.all(createCommentRequests);
  };

  return {
    createComment,
    createManyComments,
  };
};

export { createCommentsTestManager, expectedPaginatedViewComments, expectedViewComment };
export type CommentsTestManagerType = ReturnType<typeof createCommentsTestManager>;

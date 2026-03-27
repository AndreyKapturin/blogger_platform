import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import { ViewBlogType } from '../../../src/entities/blogs/types';
import request from 'supertest';
import { Express } from 'express';
import {
  InputPostType,
  PostSortField,
  ViewPostQuery,
  ViewPostType,
} from '../../../src/entities/posts/types';
import { authHeader, likeStatusesRegExp } from '../../../src/core/constants';
import { ISODateStringRegExp } from './constants';
import { faker } from '@faker-js/faker';
import {
  DEFAULT_POSTS_PAGE_SIZE,
  DEFAULT_POSTS_SORT_BY,
  DEFAULT_POSTS_SORT_DIRECTION,
  MAX_POST_TITLE_LENGTH,
} from '../../../src/entities/posts/constants';
import { Paginator, SortDirection } from '../../../src/core/types/PaginationAndSorting';
import { LikeStatus } from '../../../src/entities/comments/types';

const correctInputPostData: Partial<InputPostType> = {
  title: 'How create node js app?',
  content: 'p'.repeat(100),
  shortDescription: 'p'.repeat(50),
};

const createExpectedPost = <K extends PostSortField>(
  fieldName: K,
  value: ViewPostType[K],
): ViewPostType => {
  return {
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    createdAt: expect.stringMatching(ISODateStringRegExp),
    content: expect.any(String),
    blogName: expect.any(String),
    blogId: expect.any(String),
    extendedLikesInfo: {
      likesCount: expect.any(Number),
      dislikesCount: expect.any(Number),
      myStatus: expect.stringMatching(likeStatusesRegExp),
      newestLikes: [],
    },
    [fieldName]: value,
  };
};

const createPostsTestManager = (app: Express) => {
  const getPaginatedPosts = async (
    localPosts: ViewPostType[],
    blogId: string,
    query: Partial<ViewPostQuery> = {},
  ) => {
    let items = localPosts.filter((post) => post.blogId === blogId);

    const sortBy = query.sortBy ?? DEFAULT_POSTS_SORT_BY;
    const sortDirection = query.sortDirection ?? DEFAULT_POSTS_SORT_DIRECTION;
    const isDescSortDirection = sortDirection === SortDirection.Desc;

    items.sort((a, b) => {
      if (a[sortBy] > b[sortBy]) return isDescSortDirection ? -1 : 1;
      if (a[sortBy] < b[sortBy]) return isDescSortDirection ? 1 : -1;
      return 0;
    });

    const totalCount = items.length;
    const pageSize = query.pageSize ?? DEFAULT_POSTS_PAGE_SIZE;
    const pagesCount = Math.ceil(totalCount / pageSize) || 1;
    const page = query.pageNumber ?? 1;
    const skip = (page - 1) * pageSize;
    items = items
      .slice(skip, skip + pageSize)
      .map((item) => createExpectedPost(sortBy, item[sortBy]));

    const expectedBody: Paginator<ViewPostType> = {
      page,
      pagesCount,
      pageSize,
      totalCount,
      items,
    };

    const response = await request(app).get(Routes.BlogPostsById(blogId)).query(query);
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedBody);
    return response;
  };

  const createCorrectPost = async (
    blog: ViewBlogType,
    changedFields: Partial<InputPostType> = {},
    expectedFileds: Partial<ViewPostType> = {},
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
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
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

  const createManyPosts = async (blog: ViewBlogType, count: number): Promise<ViewPostType[]> => {
    const inputPostsData: InputPostType[] = Array.from({ length: count }).map(() => {
      return {
        blogId: blog.id,
        title: faker.lorem.word({ length: MAX_POST_TITLE_LENGTH - 1 }),
        content: faker.lorem.words({ min: 3, max: 6 }),
        shortDescription: faker.lorem.words({ min: 5, max: 10 }),
      };
    });

    const createPostResponses = await Promise.all(
      inputPostsData.map((inputPost) => {
        return createCorrectPost(blog, inputPost);
      }),
    );

    return createPostResponses.map((response) => response.body);
  };

  const createInorrectPost = async (
    changedFields: Partial<InputPostType> = {},
    excludedFileds: (keyof InputPostType)[] = [],
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
    expectedFileds: Partial<ViewPostType> = {},
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
      .put(Routes.PostById(id))
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.No_Content);

    const getResponse = await request(app).get(Routes.PostById(id));
    expect(getResponse.body).toEqual(expectedPost);
  };

  const incorrectUpdatePost = async (
    blog: ViewBlogType,
    changedFields: Partial<InputPostType>,
    excludedFileds: (keyof InputPostType)[] = [],
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
      .put(Routes.PostById(id))
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.Bad_Request);
    const getResponse = await request(app).get(Routes.PostById(id));
    expect(getResponse.body).toEqual(createResponse.body);
    return updateResponse;
  };

  return {
    getPaginatedPosts,
    createCorrectPost,
    createManyPosts,
    createInorrectPost,
    correctUpdatePost,
    incorrectUpdatePost,
  };
};

export { createPostsTestManager, correctInputPostData };
export type PostsTestManagerType = ReturnType<typeof createPostsTestManager>;

import { Routes } from '../../../src/app/routes';
import { HttpStatus } from '../../../src/core/types/HttpStatus';
import { BlogSortField, InputBlogType, ViewBlogQuery, ViewBlogType } from '../../../src/entities/blogs/types';
import request from 'supertest';
import { Express } from 'express';
import { authHeader } from '../../../src/core/constants';
import { ISODateStringRegExp, WebsiteUrlRegExp } from './constants';
import { faker } from '@faker-js/faker';
import { DEFAULT_BLOG_PAGE_SIZE, DEFAULT_BLOG_SORT_BY, DEFAULT_BLOG_SORT_DIRECTION, MAX_BLOG_NAME_LENGTH } from '../../../src/entities/blogs/constants';
import { Paginator, SortDirection } from '../../../src/core/types/PaginationAndSorting';

const correctInputBlog: InputBlogType = {
  name: 'IT-KAMASUTRA',
  description: 'Web development lessons',
  websiteUrl: 'https://it-kamasutra.io',
};

const createExpectedBlog = <K extends BlogSortField>(fieldName: K, value: ViewBlogType[K]) => {
  return {
    id: expect.any(String),
    name: expect.any(String),
    description: expect.any(String),
    createdAt: expect.stringMatching(ISODateStringRegExp),
    isMembership: false,
    websiteUrl: expect.stringMatching(WebsiteUrlRegExp),
    [fieldName]: value
  };
};

const createBlogsTestManager = (app: Express) => {
  const getPaginatedBlogs = async (localBlogs: ViewBlogType[], query: Partial<ViewBlogQuery> = {}) => {
  let items = [...localBlogs];

  if (query.searchNameTerm) {
    const searchNameTermRegExp = new RegExp(query.searchNameTerm!, 'i');
    items = items.filter((blog) => blog.name.search(searchNameTermRegExp) !== -1);
  }

  const sortBy = query.sortBy ?? DEFAULT_BLOG_SORT_BY;
  const sortDirection = query.sortDirection ?? DEFAULT_BLOG_SORT_DIRECTION;
  const isDescSortDirection = sortDirection === SortDirection.Desc;

  items.sort((a, b) => {
    if (a[sortBy] > b[sortBy]) return isDescSortDirection ? -1 : 1;
    if (a[sortBy] < b[sortBy]) return isDescSortDirection ? 1 : -1;
    return 0;
  });

  const totalCount = items.length;
  const pageSize = query.pageSize ?? DEFAULT_BLOG_PAGE_SIZE;
  const pagesCount = Math.ceil(totalCount / pageSize) || 1;
  const page = query.pageNumber ?? 1;
  const skip = (page - 1) * pageSize;

  items = items
    .slice(skip, skip + pageSize)
    .map(item => createExpectedBlog(sortBy, item[sortBy]));

  const expectedBody: Paginator<ViewBlogType> = {
    page,
    pagesCount,
    pageSize,
    totalCount,
    items,
  };

  const response = await request(app).get(Routes.Blogs).query(query);
  expect(response.status).toBe(HttpStatus.Ok);
  expect(response.body).toEqual(expectedBody);
  return response;
};

  const createCorrectBlog = async (
    changedFields: Partial<InputBlogType> = {},
    expectedFileds: Partial<InputBlogType> = {},
  ) => {
    const inputBlog: InputBlogType = {
      ...correctInputBlog,
      ...changedFields,
    };
    const expectedBlog: ViewBlogType = {
      id: expect.any(String),
      isMembership: false,
      createdAt: expect.stringMatching(ISODateStringRegExp),
      ...correctInputBlog,
      ...changedFields,
      ...expectedFileds,
    };
    const response = await request(app)
      .post(Routes.Blogs)
      .set('Authorization', authHeader)
      .send(inputBlog);

    expect(response.status).toBe(HttpStatus.Created);
    expect(response.body).toEqual(expectedBlog);
    return response;
  };

  const createManyBlogs = async (count: number): Promise<ViewBlogType[]> => {
    const inputBlogsData: InputBlogType[] = Array.from({ length: count }).map(() => {
      return {
        name: faker.lorem.word({ length: MAX_BLOG_NAME_LENGTH - 1 }),
        description: faker.lorem.words({ min: 10, max: 30 }),
        websiteUrl: faker.internet.url({ protocol: 'https' }),
      };
    });

    const createBlogResponses = await Promise.all(inputBlogsData.map(inputBlog => {
      return createCorrectBlog(inputBlog)
    }))

    return createBlogResponses.map((response) => response.body);
  };

  const createInorrectBlog = async (
    changedFields: Partial<InputBlogType> = {},
    excludedFileds: (keyof InputBlogType)[] = [],
  ) => {
    const inputBlog: InputBlogType = {
      ...correctInputBlog,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete inputBlog[key];
    }

    const response = await request(app)
      .post(Routes.Blogs)
      .set('Authorization', authHeader)
      .send(inputBlog);
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

  const correctUpdateBlog = async (
    changedFields: Partial<InputBlogType>,
    expectedFileds: Partial<InputBlogType> = {},
  ) => {
    const initialBlogResponse = await createCorrectBlog();
    const { id, ...createdBlog } = initialBlogResponse.body;
    const dataForUpdate: InputBlogType = {
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      ...changedFields,
    };

    const expectedBlog: ViewBlogType = {
      id: expect.any(String),
      isMembership: false,
      createdAt: expect.stringMatching(ISODateStringRegExp),
      ...dataForUpdate,
      ...expectedFileds,
    };

    const updateResponse = await request(app)
      .put(Routes.BlogById(id))
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.No_Content);

    const getResponse = await request(app).get(Routes.BlogById(id));
    expect(getResponse.body).toEqual(expectedBlog);
  };

  const incorrectUpdateBlog = async (
    changedFields: Partial<InputBlogType>,
    excludedFileds: (keyof InputBlogType)[] = [],
  ) => {
    const createResponse = await createCorrectBlog();
    const { id, ...createdBlog } = { ...createResponse.body };
    const dataForUpdate = {
      ...createdBlog,
      ...changedFields,
    };

    for (const key of excludedFileds) {
      delete dataForUpdate[key];
    }

    const updateResponse = await request(app)
      .put(Routes.BlogById(id))
      .set('Authorization', authHeader)
      .send(dataForUpdate);
    expect(updateResponse.status).toBe(HttpStatus.Bad_Request);

    const getResponse = await request(app).get(Routes.BlogById(id));
    expect(getResponse.body).toEqual(createResponse.body);
    return updateResponse;
  };

  return {
    getPaginatedBlogs,
    createCorrectBlog,
    createManyBlogs,
    createInorrectBlog,
    correctUpdateBlog,
    incorrectUpdateBlog,
  };
};

export { createBlogsTestManager, correctInputBlog, createExpectedBlog };
export type BlogsTestManagerType = ReturnType<typeof createBlogsTestManager>;

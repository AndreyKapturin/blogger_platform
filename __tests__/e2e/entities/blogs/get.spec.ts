import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { Paginator, SortDirection } from '../../../../src/core/types/PaginationAndSorting';
import { BlogSortField, ViewBlogQuery, ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import {
  DEFAULT_BLOG_PAGE_SIZE,
  DEFAULT_BLOG_SORT_BY,
  DEFAULT_BLOG_SORT_DIRECTION,
} from '../../../../src/entities/blogs/constants';

let app: Express;
let blogTestManager: BlogsTestManagerType;
let blogs: ViewBlogType[];

beforeAll(async () => {
  app = await createApp();
  blogTestManager = createBlogsTestManager(app);
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  blogs = await blogTestManager.createManyBlogs(10);
});

const getBlogs = async (localBlogs: ViewBlogType[], query: Partial<ViewBlogQuery> = {}) => {
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
  items = items.slice(skip, skip + pageSize);

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

describe(`GET ${Routes.Blogs}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('paginated blogs with default sorting', async () => {
      await getBlogs(blogs);
    });

    it.each([
      {
        sortDirection: SortDirection.Asc,
        sortBy: BlogSortField.Name,
        pageSize: 5,
      },
      {
        sortDirection: SortDirection.Asc,
        sortBy: BlogSortField.CreatedAt,
        pageSize: 15,
      },
    ])(
      `paginated blogs with $sortDirection by $sortBy field sorting and $pageSize blogs on page`,
      async ({ sortDirection, sortBy, pageSize }) => {
        await getBlogs(blogs, { pageSize, sortBy, sortDirection });
      },
    );

    it.each(['blog 1', 'blog 2', 'another', 'unexisted'])(
      'search "%s" substring in blog name',
      async (searchNameTerm) => {
        await getBlogs(blogs, { searchNameTerm });
      },
    );
  });
});

afterAll(async () => {
  await closeBbConnection();
});

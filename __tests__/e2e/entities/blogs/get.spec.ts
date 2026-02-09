import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { SortDirection } from '../../../../src/core/types/PaginationAndSorting';
import { BlogSortField, ViewBlogQuery, ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';

let app: Express;
let blogTestManager: BlogsTestManagerType;
let blogs: ViewBlogType[];

beforeAll(async () => {
  app = await createApp();
  blogTestManager = createBlogsTestManager(app);
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  blogs = await blogTestManager.createManyBlogs(1000);
});

describe(`GET ${Routes.Blogs}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('paginated blogs with default sorting', async () => {
      await blogTestManager.getPaginatedBlogs(blogs);
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
      {
        sortDirection: SortDirection.Desc,
        sortBy: BlogSortField.Name,
        pageSize: 25,
      },
    ])(
      `paginated blogs with $sortDirection by $sortBy field sorting and $pageSize blogs on page`,
      async ({ sortDirection, sortBy, pageSize }) => {
        await blogTestManager.getPaginatedBlogs(blogs, { pageSize, sortBy, sortDirection });
      },
    );

    it.each(['blog 1', 'blog 2', 'another', 'unexisted'])(
      'search "%s" substring in blog name',
      async (searchNameTerm) => {
        await blogTestManager.getPaginatedBlogs(blogs, { searchNameTerm });
      },
    );
  });
});

afterAll(async () => {
  await closeBbConnection();
});

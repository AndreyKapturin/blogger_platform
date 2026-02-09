import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { SortDirection } from '../../../../src/core/types/PaginationAndSorting';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/PostsTestManager';
import { PostSortField, ViewPostType } from '../../../../src/entities/posts/types';

let app: Express;
let blogTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let blogs: ViewBlogType[];
let posts: ViewPostType[];


beforeAll(async () => {
  app = await createApp();
  blogTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);

  blogs = await blogTestManager.createManyBlogs(3);

  const blog1Posts = await postsTestManager.createManyPosts(blogs[0], 100);
  const blog2Posts = await postsTestManager.createManyPosts(blogs[1], 150);

  posts = [
    ...blog1Posts,
    ...blog2Posts,
  ]
});

describe(`GET ${Routes.Posts}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('paginated posts with default sorting', async () => {
      await postsTestManager.getPaginatedPosts(posts, blogs[0].id);
    });

    it.each([
      {
        sortDirection: SortDirection.Asc,
        sortBy: PostSortField.Title,
        pageSize: 5,
      },
      {
        sortDirection: SortDirection.Asc,
        sortBy: PostSortField.CreatedAt,
        pageSize: 15,
      },
      {
        sortDirection: SortDirection.Desc,
        sortBy: PostSortField.BlogName,
        pageSize: 10,
      },
    ])(
      'paginated posts with $sortDirection by $sortBy field sorting and $pageSize posts on page',
      async ({ sortDirection, sortBy, pageSize }) => {
        await postsTestManager.getPaginatedPosts(posts, blogs[1].id, { pageSize, sortBy, sortDirection });
      },
    );
  });
});

afterAll(async () => {
  await closeBbConnection();
});


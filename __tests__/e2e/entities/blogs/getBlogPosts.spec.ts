import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { SortDirection } from '../../../../src/core/types/PaginationAndSorting';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/postsTestManager';
import { PostSortField, ViewPostType } from '../../../../src/entities/posts/types';
import { ObjectId } from 'mongodb';

let app: Express;
let blogTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let blogs: ViewBlogType[];
let posts: ViewPostType[];
const notExistBlogId = new ObjectId().toString();


beforeAll(async () => {
  app = await createApp();
  blogTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  blogs = await blogTestManager.createManyBlogs(3);

  const blog1Posts = await postsTestManager.createManyPosts(blogs[0], 10);
  const blog2Posts = await postsTestManager.createManyPosts(blogs[1], 15);
  
  posts = [
    ...blog1Posts,
    ...blog2Posts,
  ]

});

describe(`GET ${Routes.BlogPostsById(':id')}`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('paginated posts with default sorting', async () => {
      await postsTestManager.getPaginatedPosts(posts, blogs[0].id);
    });

    it.each([
      {
        sortDirection: SortDirection.Asc,
        sortBy: PostSortField.Title,
        pageSize: 5,
        pageNumber: 2,
      },
      {
        sortDirection: SortDirection.Asc,
        sortBy: PostSortField.CreatedAt,
        pageSize: 15,
        pageNumber: 1,
      },
      {
        sortDirection: SortDirection.Desc,
        sortBy: PostSortField.BlogName,
        pageSize: 20,
        pageNumber: 2,
      },
      {
        sortDirection: SortDirection.Asc,
        sortBy: PostSortField.BlogName,
        pageSize: 10,
        pageNumber: 1,
      },
    ])(
      'paginated posts with $sortDirection by $sortBy field sorting and $pageSize posts on page',
      async ({ sortDirection, sortBy, pageSize, pageNumber }) => {
        await postsTestManager.getPaginatedPosts(posts, blogs[1].id, { pageSize, sortBy, sortDirection, pageNumber });
      },
    );
  });

  describe(`should return ${HttpStatus.Not_Found} status code`, () => {
    it('blog not existed', async () => {
      const response = await request(app).get(Routes.BlogPostsById(notExistBlogId));
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});

import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { Paginator, SortDirection } from '../../../../src/core/types/PaginationAndSorting';
import { ViewBlogType } from '../../../../src/entities/blogs/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { BlogsTestManagerType, createBlogsTestManager } from '../../utils/blogsTestManager';
import { createPostsTestManager, PostsTestManagerType } from '../../utils/PostsTestManager';
import { PostSortField, ViewPostQuery, ViewPostType } from '../../../../src/entities/posts/types';
import {
  DEFAULT_POSTS_PAGE_SIZE,
  DEFAULT_POSTS_SORT_BY,
  DEFAULT_POSTS_SORT_DIRECTION,
} from '../../../../src/entities/posts/constants';
import { ObjectId } from 'mongodb';

let app: Express;
let blogTestManager: BlogsTestManagerType;
let postsTestManager: PostsTestManagerType;
let blogs: ViewBlogType[];
let posts: ViewPostType[];
const notExistBlogId = new ObjectId().toString();

const createManyBlogsWithPosts = async () => {
  const blogNames = Array.from({ length: 3 }).map((_, i) => `Blog ${i + 1}`);
  blogNames.push('blog 11');
  blogNames.push('Another name');

  const createdBlogs: ViewBlogType[] = [];
  const createdPosts: ViewPostType[] = [];

  for await (const blogName of blogNames) {
    const createBlogResponse = await blogTestManager.createCorrectBlog({ name: blogName });
    const createdBlog = createBlogResponse.body;
    createdBlogs.push(createdBlog);

    const postTitles = Array.from({ length: 10 }).map(
      (_, i) => `${createdBlog.name} - post ${i + 1}`,
    );

    for await (const postTitle of postTitles) {
      const createPostResponse = await postsTestManager.createCorrectPost(createdBlog, {
        title: postTitle,
      });
      createdPosts.push(createPostResponse.body);
    }
  }

  return { createdBlogs, createdPosts };
};

const getPosts = async (
  localPosts: ViewPostType[],
  blogId: string,
  query: Partial<ViewPostQuery> = {},
) => {
  let items = [...localPosts].filter((post) => post.blogId === blogId);

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
  items = items.slice(skip, skip + pageSize);

  const expectedBody: Paginator<ViewPostType> = {
    page,
    pagesCount,
    pageSize,
    totalCount,
    items,
  };

  const response = await request(app).get(`${Routes.Blogs}/${blogId}/posts`).query(query);
  expect(response.status).toBe(HttpStatus.Ok);
  expect(response.body).toEqual(expectedBody);
  return response;
};

beforeAll(async () => {
  app = await createApp();
  blogTestManager = createBlogsTestManager(app);
  postsTestManager = createPostsTestManager(app);
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  const { createdBlogs, createdPosts } = await createManyBlogsWithPosts();
  blogs = createdBlogs;
  posts = createdPosts;
});

describe(`GET ${Routes.Blogs}/:id/posts`, () => {
  describe(`should return ${HttpStatus.Ok} status code`, () => {
    it('paginated posts with default sorting', async () => {
      await getPosts(posts, blogs[0].id);
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
        await getPosts(posts, blogs[0].id, { pageSize, sortBy, sortDirection, pageNumber });
      },
    );
  });

  describe(`should return ${HttpStatus.Not_Found} status code`, () => {
    it('blog not existed', async () => {
      const response = await request(app).get(`${Routes.Blogs}/${notExistBlogId}/posts`);
      expect(response.status).toBe(HttpStatus.Not_Found);
    });
  });
});

afterAll(async () => {
  await closeBbConnection();
});

import { getBlogs } from './handlers/getBlogs';
import { createBlog } from './handlers/createBlog';
import { createPostForBlog } from './handlers/createPostForBlog';
import { getBlogById } from './handlers/getBlogById';
import { updateBlog } from './handlers/updateBlog';
import { deleteBlog } from './handlers/deleteBlog';
import { getPostsOfBlog } from './handlers/getPostsOfBlog';

const blogsController = {
  getBlogs,
  createBlog,
  createPostForBlog,
  getBlogById,
  getPostsOfBlog,
  updateBlog,
  deleteBlog,
};

export { blogsController };

import { getBlogs } from './handlers/getBlogs';
import { createBlog } from './handlers/createBlog';
import { getBlogById } from './handlers/getBlogById';
import { updateBlog } from './handlers/updateBlog';
import { deleteBlog } from './handlers/deleteBlog';
import { getPostsOfBlog } from './handlers/getPostsOfBlog';

const blogsController = {
  getBlogs,
  createBlog,
  getBlogById,
  getPostsOfBlog,
  updateBlog,
  deleteBlog,
};

export { blogsController };

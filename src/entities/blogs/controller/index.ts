import { getBlogs } from './handlers/getBlogs';
import { createBlog } from './handlers/createBlog';
import { getBlogById } from './handlers/getBlogById';
import { updateBlog } from './handlers/updateBlog';
import { deleteBlog } from './handlers/deleteBlog';

const blogsController = {
  getBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
};

export { blogsController };

import { getPosts } from './handlers/getPosts';
import { getPostById } from './handlers/getPostById';
import { createPost } from './handlers/createPost';
import { updatePost } from './handlers/updatePost';
import { deletePost } from './handlers/deletePost';

const postsController = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};

export { postsController };

import { BusinessLogicError } from '../../../core/errors/BusinessLogicError';
import { blogsRepository } from '../../blogs/repository/blogsRepository';
import { postsRepository } from '../repository/postsRepository';
import { InputPostType, PostType } from '../types';

const getPosts = async () => {
  const posts = await postsRepository.findAll();
  return posts;
};

const getPostById = async (postId: string) => {
  const foundPost = await postsRepository.findById(postId);
  return foundPost;
};

const createPost = async (inputPost: InputPostType) => {
  const blog = await blogsRepository.findById(inputPost.blogId);
  if (!blog) throw new BusinessLogicError(`Blog not found by ${inputPost.blogId} id`);

  const newPost: PostType = {
    title: inputPost.title,
    content: inputPost.content,
    shortDescription: inputPost.shortDescription,
    createdAt: new Date().toISOString(),
    blogId: blog._id.toString(),
    blogName: blog.name,
  };

  const createdPost = await postsRepository.save(newPost);
  return createdPost;
};

const updatePost = async (postId: string, inputPost: InputPostType) => {
  const blog = await blogsRepository.findById(inputPost.blogId);
  if (!blog) throw new BusinessLogicError(`Blog not found by ${inputPost.blogId} id`);

  const updatedPost = {
    title: inputPost.title,
    content: inputPost.content,
    shortDescription: inputPost.shortDescription,
    blogId: blog._id.toString(),
    blogName: blog.name,
  };

  const wasUpdated = await postsRepository.update(postId, updatedPost);
  return wasUpdated;
};

const deletePost = async (postId: string) => {
  const wasDeleted = await postsRepository.remove(postId);
  return wasDeleted;
};

const postsService = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};

export { postsService };

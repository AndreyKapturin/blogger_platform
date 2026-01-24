import { ResourceNotFoundError } from '../../../core/errors/ResourceNotFoundError';
import { blogsRepository } from '../../blogs/repository/blogsRepository';
import { postsRepository } from '../repository/postsRepository';
import { InputPostType, PostType, ViewPostQuery } from '../types';

const getPosts = async (postsQuery: ViewPostQuery) => {
  return postsRepository.findAll(postsQuery);
};

const getPostsForBlog = async (blogId: string, postsQuery: ViewPostQuery) => {
  const blog = await blogsRepository.findById(blogId);
  if (!blog) throw new ResourceNotFoundError(`Blog with id ${blogId} not found`);
  return postsRepository.findAllForBlog(blogId, postsQuery);
};

const getPostById = async (postId: string) => {
  const foundPost = await postsRepository.findById(postId);
  return foundPost;
};

const createPost = async (inputPost: InputPostType) => {
  const blog = await blogsRepository.findById(inputPost.blogId);
  if (!blog) throw new ResourceNotFoundError(`Blog with id ${inputPost.blogId} not found`);

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
  if (!blog) throw new ResourceNotFoundError(`Blog not found by ${inputPost.blogId} id`);

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
  getPostsForBlog,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};

export { postsService };

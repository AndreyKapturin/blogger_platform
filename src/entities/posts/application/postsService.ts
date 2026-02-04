import { ResourceNotFoundError } from '../../../core/errors/ResourceNotFoundError';
import { blogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { postsCommandRepository } from '../repositories/postsCommandRepository';
import { InputPostType, InputUpdatePostType, PostType } from '../types';

const createPost = async (inputPost: InputPostType) => {
  const blog = await blogsCommandRepository.findById(inputPost.blogId);
  if (!blog) throw new ResourceNotFoundError(`Blog with id ${inputPost.blogId} not found`);

  const newPost: PostType = {
    title: inputPost.title,
    content: inputPost.content,
    shortDescription: inputPost.shortDescription,
    createdAt: new Date().toISOString(),
    blogId: blog.id,
    blogName: blog.name,
  };

  const createdPostId = await postsCommandRepository.save(newPost);
  return createdPostId;
};

const updatePost = async (postId: string, inputPost: InputPostType) => {
  const blog = await blogsCommandRepository.findById(inputPost.blogId);
  if (!blog) throw new ResourceNotFoundError(`Blog not found by ${inputPost.blogId} id`);

  const updatedPost: InputUpdatePostType = {
    title: inputPost.title,
    content: inputPost.content,
    shortDescription: inputPost.shortDescription,
    blogId: blog.id,
    blogName: blog.name,
  };

  const wasUpdated = await postsCommandRepository.update(postId, updatedPost);
  return wasUpdated;
};

const deletePost = async (postId: string) => postsCommandRepository.remove(postId);

const postsService = {
  createPost,
  updatePost,
  deletePost,
};

export { postsService };

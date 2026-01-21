import { postsRepository } from '../../posts/repository/postsRepository';
import { blogsRepository } from '../repository/blogsRepository';
import { BlogType, InputBlogType } from '../types';

const getBlogs = async () => {
  return await blogsRepository.findAll();
};

const getBlogById = async (blogId: string) => {
  return await blogsRepository.findById(blogId);
};

const createBlog = async (inputBlog: InputBlogType) => {
  const newBlog: BlogType = {
    name: inputBlog.name,
    description: inputBlog.description,
    websiteUrl: inputBlog.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  };
  const createdBlog = await blogsRepository.save(newBlog);
  return createdBlog;
};

const updateBlog = async (blogId: string, inputBlog: InputBlogType) => {
  const updatedBlog: InputBlogType = {
    name: inputBlog.name,
    description: inputBlog.description,
    websiteUrl: inputBlog.websiteUrl,
  };
  const wasUpdated = await blogsRepository.update(blogId, updatedBlog);
  if (wasUpdated) {
    await postsRepository.updateRelated(blogId, updatedBlog.name);
  }
  return wasUpdated;
};

const deleteBlog = async (blogId: string) => {
  const wasDeleted = await blogsRepository.remove(blogId);
  if (wasDeleted) {
    await postsRepository.removeRelated(blogId);
  }
  return wasDeleted;
};

const blogsService = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};

export { blogsService };

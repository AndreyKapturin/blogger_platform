import { database } from '../../database';
import { BlogType } from './types';

const fildAll = () => database.blogs;
const findById = (blogId: string) => {
  return database.blogs.find((b) => b.id === blogId) ?? null;
};
const save = (inputBlog: BlogType) => {
  database.blogs.push(inputBlog);
  return inputBlog;
};
const update = (inputBlog: BlogType) => {
  for (const blog of database.blogs) {
    if (blog.id === inputBlog.id) {
      blog.name = inputBlog.name;
      blog.description = inputBlog.description;
      blog.websiteUrl = inputBlog.websiteUrl;
      return true;
    }
  }
  return false;
};
const remove = (blogId: string) => {
  let wasDeleted = false;
  database.blogs = database.blogs.filter(blog => {
    if (blog.id === blogId) {
      wasDeleted = true;
      return false;
    }
    return true
  })
  return wasDeleted;
};

const blogsRepository = {
  fildAll,
  findById,
  save,
  update,
  remove,
};

export { blogsRepository };

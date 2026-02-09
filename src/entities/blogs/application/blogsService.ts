import { Result, ResultStatus } from '../../../core/types/Result';
import { postsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { blogsCommandRepository } from '../repositories/blogsCommandRepository';
import { BlogType, InputBlogType } from '../types';

const createBlog = async (inputBlog: InputBlogType) => {
  const newBlog: BlogType = {
    name: inputBlog.name,
    description: inputBlog.description,
    websiteUrl: inputBlog.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  };

  const createdBlogId = await blogsCommandRepository.save(newBlog);

  const result: Result<string> = {
    status: ResultStatus.Success,
    data: createdBlogId,
    extensions: [],
  };

  return result;
};

const updateBlog = async (blogId: string, inputBlog: InputBlogType) => {
  const updatedBlog: InputBlogType = {
    name: inputBlog.name,
    description: inputBlog.description,
    websiteUrl: inputBlog.websiteUrl,
  };
  const wasUpdated = await blogsCommandRepository.update(blogId, updatedBlog);
  if (wasUpdated) {
    await postsCommandRepository.updateRelated(blogId, updatedBlog.name);
  }
  return wasUpdated;
};

const deleteBlog = async (blogId: string) => {
  const wasDeleted = await blogsCommandRepository.remove(blogId);

  if (wasDeleted) {
    await postsCommandRepository.removeRelated(blogId);

    const result: Result = {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };

    return result;
  }

  const result: Result = {
    status: ResultStatus.NotFound,
    errorMessage: 'Blog not found',
    extensions: [
      {
        field: 'blogId',
        message: `Blog with id ${blogId} not found`,
      },
    ],
  };

  return result;
};

const blogsService = {
  createBlog,
  updateBlog,
  deleteBlog,
};

export { blogsService };

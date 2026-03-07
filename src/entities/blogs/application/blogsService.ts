import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { postsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { blogsCommandRepository } from '../repositories/blogsCommandRepository';
import { BlogType, InputBlogType } from '../types';

const createBlog = async (inputBlog: InputBlogType): Promise<Result<string>> => {
  const newBlog: BlogType = {
    name: inputBlog.name,
    description: inputBlog.description,
    websiteUrl: inputBlog.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  };

  const createdBlogId = await blogsCommandRepository.save(newBlog);
  return ResultFactory.success(createdBlogId);
};

const updateBlog = async (blogId: string, inputBlog: InputBlogType): Promise<Result<boolean>> => {
  const updatedBlog: InputBlogType = {
    name: inputBlog.name,
    description: inputBlog.description,
    websiteUrl: inputBlog.websiteUrl,
  };

  const wasUpdated = await blogsCommandRepository.update(blogId, updatedBlog);

  if (wasUpdated) {
    await postsCommandRepository.updateRelated(blogId, updatedBlog.name);
    return ResultFactory.success(wasUpdated);
  }

  return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
    {
      field: 'blogId',
      message: `Blog with id ${blogId} not found`,
    },
  ]);
};

const deleteBlog = async (blogId: string): Promise<Result> => {
  const wasDeleted = await blogsCommandRepository.remove(blogId);

  if (wasDeleted) {
    await postsCommandRepository.removeRelated(blogId);
    return ResultFactory.success(null);
  }

  return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
    {
      field: 'blogId',
      message: `Blog with id ${blogId} not found`,
    },
  ]);
};

const blogsService = {
  createBlog,
  updateBlog,
  deleteBlog,
};

export { blogsService };

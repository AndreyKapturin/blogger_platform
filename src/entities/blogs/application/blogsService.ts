import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { PostsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { BlogsCommandRepository } from '../repositories/blogsCommandRepository';
import { BlogType, InputBlogType } from '../types';

@injectable()
class BlogsService {
  constructor(
    @inject(BlogsCommandRepository)
    private blogsCommandRepository: BlogsCommandRepository,
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
  ) {}

  async createBlog(inputBlog: InputBlogType): Promise<Result<string>> {
    const newBlog: BlogType = {
      name: inputBlog.name,
      description: inputBlog.description,
      websiteUrl: inputBlog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createdBlogId = await this.blogsCommandRepository.save(newBlog);
    return ResultFactory.success(createdBlogId);
  }

  async updateBlog(blogId: string, inputBlog: InputBlogType): Promise<Result<boolean>> {
    const updatedBlog: InputBlogType = {
      name: inputBlog.name,
      description: inputBlog.description,
      websiteUrl: inputBlog.websiteUrl,
    };

    const wasUpdated = await this.blogsCommandRepository.update(blogId, updatedBlog);

    if (wasUpdated) {
      await this.postsCommandRepository.updateRelated(blogId, updatedBlog.name);
      return ResultFactory.success(wasUpdated);
    }

    return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
      {
        field: 'blogId',
        message: `Blog with id ${blogId} not found`,
      },
    ]);
  }

  async deleteBlog(blogId: string): Promise<Result> {
    const wasDeleted = await this.blogsCommandRepository.remove(blogId);

    if (wasDeleted) {
      await this.postsCommandRepository.removeRelated(blogId);
      return ResultFactory.success(null);
    }

    return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
      {
        field: 'blogId',
        message: `Blog with id ${blogId} not found`,
      },
    ]);
  }
}

export { BlogsService };

import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { PostsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { BlogsCommandRepository } from '../repositories/blogsCommandRepository';
import { BlogModel } from '../domain/BlogModel';
import { InputCreateBlogDto } from '../domain/InputCreateBlogDto';
import { InputUpdateBlogDto } from '../domain/InputUpdateBlogDto';

@injectable()
class BlogsService {
  constructor(
    @inject(BlogsCommandRepository)
    private blogsCommandRepository: BlogsCommandRepository,
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
  ) {}
  async createBlog(inputCreateBlogDto: InputCreateBlogDto): Promise<Result<string>> {
    const newBlogDocument = new BlogModel({
      name: inputCreateBlogDto.name,
      description: inputCreateBlogDto.description,
      websiteUrl: inputCreateBlogDto.websiteUrl,
      isMembership: false,
      createdAt: new Date(),
    });

    const createdBlogId = await this.blogsCommandRepository.save(newBlogDocument);
    return ResultFactory.success(createdBlogId);
  }

  async updateBlog(id: string, inputUpdateBlogDto: InputUpdateBlogDto): Promise<Result<boolean>> {
    const blogDocument = await this.blogsCommandRepository.findById(id);

    if (!blogDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'id',
          message: `Blog with id ${id} not found`,
        },
      ]);
    }

    blogDocument.name = inputUpdateBlogDto.name;
    blogDocument.description = inputUpdateBlogDto.description;
    blogDocument.websiteUrl = inputUpdateBlogDto.websiteUrl;

    await this.blogsCommandRepository.update(blogDocument);
    await this.postsCommandRepository.updateRelated(id, blogDocument.name);
    return ResultFactory.success(true);
  }

  async deleteBlog(id: string): Promise<Result> {
    const blogDocument = await this.blogsCommandRepository.findById(id);

    if (!blogDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'id',
          message: `Blog with id ${id} not found`,
        },
      ]);
    }

    await this.blogsCommandRepository.delete(blogDocument);
    await this.postsCommandRepository.removeRelated(id);
    return ResultFactory.success(null);
  }
}

export { BlogsService };

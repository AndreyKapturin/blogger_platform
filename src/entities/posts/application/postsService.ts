import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { BlogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { PostsCommandRepository } from '../repositories/postsCommandRepository';
import { InputPostType, InputUpdatePostType, PostType } from '../types';

@injectable()
class PostsService {
  constructor(
    @inject(BlogsCommandRepository)
    private blogsCommandRepository: BlogsCommandRepository,
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
  ) {}

  async createPost(inputPost: InputPostType): Promise<Result<string>> {
    const blog = await this.blogsCommandRepository.findById(inputPost.blogId);

    if (!blog) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'blogId',
          message: `Blog with id ${inputPost.blogId} not found`,
        },
      ]);
    }

    const newPost: PostType = {
      title: inputPost.title,
      content: inputPost.content,
      shortDescription: inputPost.shortDescription,
      createdAt: new Date().toISOString(),
      blogId: blog.id,
      blogName: blog.name,
    };

    const createdPostId = await this.postsCommandRepository.save(newPost);

    return ResultFactory.success(createdPostId);
  }

  async updatePost(postId: string, inputPost: InputPostType): Promise<Result<string | null>> {
    const blog = await this.blogsCommandRepository.findById(inputPost.blogId);

    if (!blog) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'blogId',
          message: `Blog with id ${inputPost.blogId} not found`,
        },
      ]);
    }

    const updatedPost: InputUpdatePostType = {
      title: inputPost.title,
      content: inputPost.content,
      shortDescription: inputPost.shortDescription,
      blogId: blog.id,
      blogName: blog.name,
    };

    const wasUpdated = await this.postsCommandRepository.update(postId, updatedPost);

    if (!wasUpdated) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    return ResultFactory.success(null);
  }

  async deletePost(postId: string): Promise<Result> {
    const wasDeleted = await this.postsCommandRepository.remove(postId);

    if (!wasDeleted) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${postId} not exist`,
        },
      ]);
    }

    return ResultFactory.success(null);
  }
}

export { PostsService };

import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { BlogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { PostsCommandRepository } from '../repositories/postsCommandRepository';
import { PostModel } from '../domain/PostModel';
import { InputCreatePostDto } from '../domain/InputCreatePostDto';
import { InputUpdatePostDto } from '../domain/InputUpdatePostDto';
import { InputPostLikeStatusDto } from '../domain/InputPostLikeStatusDto';
import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';

@injectable()
class PostsService {
  constructor(
    @inject(BlogsCommandRepository)
    private blogsCommandRepository: BlogsCommandRepository,
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
    @inject(UsersCommandRepository)
    private usersCommandRepository: UsersCommandRepository,
  ) {}
  async createPost(inputCreatePostDto: InputCreatePostDto): Promise<Result<string>> {
    const blogDocument = await this.blogsCommandRepository.findById(inputCreatePostDto.blogId);

    if (!blogDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'blogId',
          message: `Blog with id ${inputCreatePostDto.blogId} not found`,
        },
      ]);
    }

    const newPostDocument = new PostModel({
      title: inputCreatePostDto.title,
      content: inputCreatePostDto.content,
      shortDescription: inputCreatePostDto.shortDescription,
      blogName: blogDocument.name,
      blogId: blogDocument.id,
      createdAt: new Date(),
    });

    const createdPostId = await this.postsCommandRepository.save(newPostDocument);

    return ResultFactory.success(createdPostId);
  }

  async updatePost(
    postId: string,
    inputUpdatePostDto: InputUpdatePostDto,
  ): Promise<Result<string | null>> {
    const blogDocument = await this.blogsCommandRepository.findById(inputUpdatePostDto.blogId);

    if (!blogDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'blogId',
          message: `Blog with id ${inputUpdatePostDto.blogId} not found`,
        },
      ]);
    }

    const postDocument = await this.postsCommandRepository.findById(postId);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    postDocument.title = inputUpdatePostDto.title;
    postDocument.content = inputUpdatePostDto.content;
    postDocument.shortDescription = inputUpdatePostDto.shortDescription;
    postDocument.blogId = blogDocument.id;
    postDocument.blogName = blogDocument.name;

    await this.postsCommandRepository.update(postDocument);
    return ResultFactory.success(null);
  }

  async deletePost(id: string): Promise<Result> {
    const postDocument = await this.postsCommandRepository.findById(id);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${id} not exist`,
        },
      ]);
    }

    await this.postsCommandRepository.delete(postDocument);
    return ResultFactory.success(null);
  }

  async changeLikeStatus(inputPostLikeStatusDto: InputPostLikeStatusDto): Promise<Result> {
    const { postId, newLikeStatus, userId } = inputPostLikeStatusDto;

    const userDocument = await this.usersCommandRepository.findById(userId);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'User unauthorized', [
        {
          field: 'accessToken',
          message: `User unauthorized`,
        },
      ]);
    }

    const postDocument = await this.postsCommandRepository.findById(postId);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    postDocument.changeLikeStatus(userId, userDocument.login, newLikeStatus);
    await this.postsCommandRepository.update(postDocument);
    return ResultFactory.success(null);
  }
}

export { PostsService };

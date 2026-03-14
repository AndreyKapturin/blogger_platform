import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { PostsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { CommentsCommandRepository } from '../repositories/commentsCommandRepository';
import { MongoCommentType } from '../types';

@injectable()
class CommentsService {
  constructor(
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
    @inject(UsersCommandRepository)
    private usersCommandRepository: UsersCommandRepository,
    @inject(CommentsCommandRepository)
    private commentsCommandRepository: CommentsCommandRepository,
  ) {}

  async createComment(postId: string, userId: string, content: string): Promise<Result<string>> {
    const post = await this.postsCommandRepository.findById(postId);

    if (!post) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: null,
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    const user = await this.usersCommandRepository.findUserById(userId);

    if (!user) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'User not found', [
        {
          field: 'accessToken',
          message: 'User access token is invalid',
        },
      ]);
    }

    const newComment: MongoCommentType = {
      postId,
      content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
    };

    const createdCommentId = await this.commentsCommandRepository.save(newComment);

    return ResultFactory.success(createdCommentId);
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Result> {
    const comment = await this.commentsCommandRepository.findById(commentId);

    if (!comment) {
      return ResultFactory.wrong(ResultStatus.NotFound, `Comment with id ${commentId} not found`, [
        {
          field: 'commentId',
          message: `Comment with id ${commentId} not found`,
        },
      ]);
    }

    if (comment.commentatorInfo.userId !== userId) {
      return ResultFactory.wrong(ResultStatus.PermissionError, 'Editing not own comment', [
        {
          field: null,
          message: 'You are not the author of the comment',
        },
      ]);
    }

    await this.commentsCommandRepository.update(commentId, content);

    return ResultFactory.success(null);
  }

  async deleteComment(commentId: string, userId: string): Promise<Result> {
    const comment = await this.commentsCommandRepository.findById(commentId);

    if (!comment) {
      return ResultFactory.wrong(ResultStatus.NotFound, `Comment with id ${commentId} not found`, [
        {
          field: 'commentId',
          message: `Comment with id ${commentId} not found`,
        },
      ]);
    }

    if (comment.commentatorInfo.userId !== userId) {
      return ResultFactory.wrong(ResultStatus.PermissionError, 'Deliting not own comment', [
        {
          field: null,
          message: 'You are not the author of the comment',
        },
      ]);
    }

    await this.commentsCommandRepository.remove(commentId);

    return ResultFactory.success(null);
  }
}

export { CommentsService };

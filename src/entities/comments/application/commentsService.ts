import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { PostsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { CommentsCommandRepository } from '../repositories/commentsCommandRepository';
import { CommentModel } from '../domain/CommentModel';
import { LikeStatus } from '../types';

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
    const postDocument = await this.postsCommandRepository.findById(postId);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: null,
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    const userDocument = await this.usersCommandRepository.findById(userId);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'User not found', [
        {
          field: 'accessToken',
          message: 'User access token is invalid',
        },
      ]);
    }

    const newComment = new CommentModel({
      content,
      postId,
      commentatorInfo: {
        userId,
        userLogin: userDocument.login,
      },
      likesInfo: {
        dislikesUserIds: [],
        likesUserIds: [],
      },
    });

    const createdCommentId = await this.commentsCommandRepository.save(newComment);

    return ResultFactory.success(createdCommentId);
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Result> {
    const commentDocument = await this.commentsCommandRepository.findById(commentId);

    if (!commentDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, `Comment with id ${commentId} not found`, [
        {
          field: 'commentId',
          message: `Comment with id ${commentId} not found`,
        },
      ]);
    }

    if (commentDocument.commentatorInfo.userId !== userId) {
      return ResultFactory.wrong(ResultStatus.PermissionError, 'Editing not own comment', [
        {
          field: null,
          message: 'You are not the author of the comment',
        },
      ]);
    }

    commentDocument.content = content;

    await this.commentsCommandRepository.update(commentDocument);

    return ResultFactory.success(null);
  }

  async deleteComment(commentId: string, userId: string): Promise<Result> {
    const commentDocument = await this.commentsCommandRepository.findById(commentId);

    if (!commentDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, `Comment with id ${commentId} not found`, [
        {
          field: 'commentId',
          message: `Comment with id ${commentId} not found`,
        },
      ]);
    }

    if (commentDocument.commentatorInfo.userId !== userId) {
      return ResultFactory.wrong(ResultStatus.PermissionError, 'Deliting not own comment', [
        {
          field: null,
          message: 'You are not the author of the comment',
        },
      ]);
    }

    await this.commentsCommandRepository.delete(commentDocument);

    return ResultFactory.success(null);
  }

  async changeLikeStatus(
    commentId: string,
    userId: string,
    newStatus: LikeStatus,
  ): Promise<Result> {
    const commentDocument = await this.commentsCommandRepository.findById(commentId);

    if (!commentDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, `Comment with id ${commentId} not found`, [
        {
          field: 'commentId',
          message: `Comment with id ${commentId} not found`,
        },
      ]);
    }

    const userDocument = await this.usersCommandRepository.findById(userId);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, `User with id ${userId} not found`, [
        {
          field: 'userId',
          message: `User with id ${userId} not found`,
        },
      ]);
    }

    commentDocument.changeLikeStatus(userId, newStatus);

    await this.commentsCommandRepository.update(commentDocument);
    return ResultFactory.success(null);
  }
}

export { CommentsService };

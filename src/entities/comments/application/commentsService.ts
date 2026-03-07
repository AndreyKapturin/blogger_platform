import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { postsCommandRepository } from '../../posts/repositories/postsCommandRepository';
import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { commentsCommandRepository } from '../repositories/commentsCommandRepository';
import { MongoCommentType } from '../types';

const createComment = async (
  postId: string,
  userId: string,
  content: string,
): Promise<Result<string>> => {
  const post = await postsCommandRepository.findById(postId);

  if (!post) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
      {
        field: null,
        message: `Post with id ${postId} not found`,
      },
    ]);
  }

  const user = await usersCommandRepository.findUserById(userId);

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

  const createdCommentId = await commentsCommandRepository.save(newComment);

  return ResultFactory.success(createdCommentId);
};

const updateComment = async (
  commentId: string,
  userId: string,
  content: string,
): Promise<Result> => {
  const comment = await commentsCommandRepository.findById(commentId);

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

  await commentsCommandRepository.update(commentId, content);

  return ResultFactory.success(null);
};

const deleteComment = async (commentId: string, userId: string): Promise<Result> => {
  const comment = await commentsCommandRepository.findById(commentId);

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

  await commentsCommandRepository.remove(commentId);

  return ResultFactory.success(null);
};

const commentsService = {
  createComment,
  updateComment,
  deleteComment,
};

export { commentsService };

import { Result, ResultStatus } from "../../../core/types/Result";
import { postsCommandRepository } from "../../posts/repositories/postsCommandRepository"
import { usersCommandRepository } from "../../users/repositories/usersCommandRepository";
import { commentsCommandRepository } from "../repositories/commentsCommandRepository";
import { MongoCommentType } from "../types";

const createComment = async (
  postId: string, userId: string, content: string
): Promise<Result<string>> => {
  const post = await postsCommandRepository.findById(postId);
  
  if (!post) {
    return {
      status: ResultStatus.NotFound,
      errorMessage: 'Post not found',
      extensions: [
        {
          field: null,
          message: `Post with id ${postId} not found`
        }
      ]
    }
  }

  const user = await usersCommandRepository.findUserById(userId);

  if (!user) {
    return {
      status: ResultStatus.InvalidCredentials,
      errorMessage: 'User not found',
      extensions: [
        {
          field: null,
          message: `User access token is invalid`
        }
      ]
    }
  }

  const newComment: MongoCommentType = {
    postId,
    content,
    commentatorInfo: {
      userId: user.id,
      userLogin: user.login,
    },
    createdAt: new Date().toISOString()
  }

  const createdCommentId = await commentsCommandRepository.save(newComment);

  return {
    status: ResultStatus.Success,
    data: createdCommentId,
    extensions: []
  }
}

const updateComment = async (commentId: string, userId: string, content: string): Promise<Result> => {
  const comment = await commentsCommandRepository.findById(commentId);

  if (!comment) {
    return {
      status: ResultStatus.NotFound,
      errorMessage: `Comment with id ${commentId} not found`,
      extensions: [
        {
          field: null,
          message: `Comment with id ${commentId} not found`,
        }
      ]
    }
  }
  
  if (comment.commentatorInfo.userId !== userId) {
    return {
      status: ResultStatus.PermissionError,
      extensions: [
        {
          field: null,
          message: 'You are not the author of the comment'
        }
      ]
    }
  }

  const isUpdated = await commentsCommandRepository.update(commentId, content);

  if (!isUpdated) throw new Error('Update comment error');
  
  return {
    status: ResultStatus.Success,
    data: null,
    extensions: []
  }
}


const deleteComment = async (commentId: string, userId: string): Promise<Result> => {
  const comment = await commentsCommandRepository.findById(commentId);

  if (!comment) {
    return {
      status: ResultStatus.NotFound,
      errorMessage: `Comment with id ${commentId} not found`,
      extensions: [
        {
          field: null,
          message: `Comment with id ${commentId} not found`,
        }
      ]
    }
  }
  
  if (comment.commentatorInfo.userId !== userId) {
    return {
      status: ResultStatus.PermissionError,
      extensions: [
        {
          field: null,
          message: 'You are not the author of the comment'
        }
      ]
    }
  }

  const isDeleted = await commentsCommandRepository.remove(commentId);

  if (!isDeleted) throw new Error('Delete comment error');
  
  return {
    status: ResultStatus.Success,
    data: null,
    extensions: []
  }
}

const commentsService = {
  createComment,
  updateComment,
  deleteComment,
}

export { commentsService }
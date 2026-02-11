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
          field: 'Post id',
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

const commentsService = {
  createComment,
}

export { commentsService }
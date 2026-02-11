import { Response } from 'express';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { ResultStatus } from '../../../../core/types/Result';
import { commentsService } from '../../../comments/application/commentsService';
import { commentsQueryRepository } from '../../../comments/repositories/commentsQueryRepository';
import { CommentIdParamType, InputCommentType, ViewCommentType } from '../../../comments/types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';

const createPostCommentHandler = async (
  req: RequestWithParamsAndBody<CommentIdParamType, InputCommentType>,
  res: Response<ViewCommentType | APIErrorResult>,
) => {
  const createCommentResult = await commentsService
    .createComment(req.params.id, req.user!.userId, req.body.content);

  if (createCommentResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(createCommentResult.status))
      .json(extensionResultToAPIError(createCommentResult.extensions));
    return;
  }

  const createdComment = await commentsQueryRepository.findById(createCommentResult.data);
  res.status(HttpStatus.Created).json(createdComment!);
};

export { createPostCommentHandler };

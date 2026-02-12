import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { CommentIdParamType } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { commentsService } from '../../application/commentsService';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const deleteCommentByIdHandler = async (
  req: RequestWithParams<CommentIdParamType>,
  res: Response<APIErrorResult>,
) => {
  const deleteCommentResult = await commentsService.deleteComment(req.params.id, req.user!.userId);

  if (deleteCommentResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(deleteCommentResult.status))
      .json(extensionResultToAPIError(deleteCommentResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deleteCommentByIdHandler };

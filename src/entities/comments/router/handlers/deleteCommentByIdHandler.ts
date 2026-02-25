import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { CommentIdParamType } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { commentsService } from '../../application/commentsService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';

const deleteCommentByIdHandler = async (
  req: RequestWithParams<CommentIdParamType>,
  res: Response<APIErrorResult>,
) => {
  const deleteCommentResult = await commentsService.deleteComment(req.params.id, req.user!.userId);

  if (isWrongResult(deleteCommentResult)) {
    sendHttpResponseIfWrongResult(deleteCommentResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deleteCommentByIdHandler };

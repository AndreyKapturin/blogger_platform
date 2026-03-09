import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { CommentIdParamType, InputCommentType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { commentsService } from '../../../../compositionRoot';

const updateCommentHandler = async (
  req: RequestWithParamsAndBody<CommentIdParamType, InputCommentType>,
  res: Response,
) => {
  const updateCommentResult = await commentsService.updateComment(
    req.params.id,
    req.user!.userId,
    req.body.content,
  );

  if (isWrongResult(updateCommentResult)) {
    sendHttpResponseIfWrongResult(updateCommentResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { updateCommentHandler };

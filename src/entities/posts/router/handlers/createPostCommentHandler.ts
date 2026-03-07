import { Response } from 'express';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { commentsService } from '../../../comments/application/commentsService';
import { commentsQueryRepository } from '../../../comments/repositories/commentsQueryRepository';
import { CommentIdParamType, InputCommentType, ViewCommentType } from '../../../comments/types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';

const createPostCommentHandler = async (
  req: RequestWithParamsAndBody<CommentIdParamType, InputCommentType>,
  res: Response<ViewCommentType | APIErrorResult>,
) => {
  const createCommentResult = await commentsService.createComment(
    req.params.id,
    req.user!.userId,
    req.body.content,
  );

  if (isWrongResult(createCommentResult)) {
    sendHttpResponseIfWrongResult(createCommentResult, res);
    return;
  }

  const createdComment = await commentsQueryRepository.findById(createCommentResult.data);
  res.status(HttpStatus.Created).json(createdComment!);
};

export { createPostCommentHandler };

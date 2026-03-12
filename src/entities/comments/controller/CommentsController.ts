import { Response } from 'express';
import { RequestWithParams, RequestWithParamsAndBody } from '../../../core/types/RequestTypes';
import { CommentIdParamType, InputCommentType, ViewCommentType } from '../types';
import { CommentsQueryRepository } from '../repositories/commentsQueryRepository';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { CommentsService } from '../application/commentsService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { APIErrorResult } from '../../../core/types/APIErrorResult';

class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  async getCommentById(req: RequestWithParams<CommentIdParamType>, res: Response<ViewCommentType>) {
    const foundComment = await this.commentsQueryRepository.findById(req.params.id);

    if (!foundComment) {
      res.sendStatus(HttpStatus.Not_Found);
      return;
    }

    res.status(HttpStatus.Ok).json(foundComment);
  }

  async updateComment(
    req: RequestWithParamsAndBody<CommentIdParamType, InputCommentType>,
    res: Response,
  ) {
    const updateCommentResult = await this.commentsService.updateComment(
      req.params.id,
      req.user!.userId,
      req.body.content,
    );

    if (isWrongResult(updateCommentResult)) {
      sendHttpResponseIfWrongResult(updateCommentResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async deleteCommentById(
    req: RequestWithParams<CommentIdParamType>,
    res: Response<APIErrorResult>,
  ) {
    const deleteCommentResult = await this.commentsService.deleteComment(
      req.params.id,
      req.user!.userId,
    );

    if (isWrongResult(deleteCommentResult)) {
      sendHttpResponseIfWrongResult(deleteCommentResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }
}

export { CommentsController };

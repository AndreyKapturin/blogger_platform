import { Response } from "express";
import { RequestWithParams } from "../../../../core/types/RequestTypes";
import { CommentIdParamType, ViewCommentType } from "../../types";
import { commentsQueryRepository } from "../../../../compositionRoot";
import { HttpStatus } from "../../../../core/types/HttpStatus";

const getCommentByIdHandler = async (
  req: RequestWithParams<CommentIdParamType>,
  res: Response<ViewCommentType>
) => {
  const foundComment = await commentsQueryRepository.findById(req.params.id);

  if (!foundComment) {
    res.sendStatus(HttpStatus.Not_Found);
    return
  }

  res.status(HttpStatus.Ok).json(foundComment);
};

export { getCommentByIdHandler };

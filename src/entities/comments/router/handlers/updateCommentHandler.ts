import { Response } from "express";
import { RequestWithParamsAndBody } from "../../../../core/types/RequestTypes";
import { CommentIdParamType, InputCommentType } from "../../types";
import { commentsService } from "../../application/commentsService";
import { ResultStatus } from "../../../../core/types/Result";
import { resultStatusToHttpStatus } from "../../../../core/mappers/resultStatusToHttpStatus";
import { extensionResultToAPIError } from "../../../../core/mappers/extensionResultToAPIError";
import { HttpStatus } from "../../../../core/types/HttpStatus";

const updateCommentHandler = async (
  req: RequestWithParamsAndBody<CommentIdParamType, InputCommentType>,
  res: Response
) => {
  const updateCommentResult = await commentsService.updateComment(req.params.id, req.user!.userId, req.body.content);

  if (updateCommentResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(updateCommentResult.status))
      .json(extensionResultToAPIError(updateCommentResult.extensions))
    return
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { updateCommentHandler };

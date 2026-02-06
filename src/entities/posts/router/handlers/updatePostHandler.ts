import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputPostType, PostIdParamType } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/postsService';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';

const updatePostHandler = async (
  req: RequestWithParamsAndBody<PostIdParamType, InputPostType>,
  res: Response<APIErrorResult>,
) => {
  const updatePostResult = await postsService.updatePost(req.params.id, req.body);

  if (updatePostResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(updatePostResult.status))
      .json(extensionResultToAPIError(updatePostResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { updatePostHandler };

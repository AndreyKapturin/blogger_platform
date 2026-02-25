import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputPostType, PostIdParamType } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/postsService';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';

const updatePostHandler = async (
  req: RequestWithParamsAndBody<PostIdParamType, InputPostType>,
  res: Response<APIErrorResult>,
) => {
  const updatePostResult = await postsService.updatePost(req.params.id, req.body);

  if (isWrongResult(updatePostResult)) {
    sendHttpResponseIfWrongResult(updatePostResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { updatePostHandler };

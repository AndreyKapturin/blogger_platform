import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputPostType, PostIdParamType } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/postsService';

const updatePost = async (
  req: RequestWithParamsAndBody<PostIdParamType, InputPostType>,
  res: Response<APIErrorResult>,
) => {
  const wasUpdated = await postsService.updatePost(req.params.id, req.body);
  res.sendStatus(wasUpdated ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { updatePost };

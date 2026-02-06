import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputPostType, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/postsService';
import { postsQueryRepository } from '../../repositories/postsQueryRepository';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';

const createPost = async (
  req: RequestWithBody<InputPostType>,
  res: Response<ViewPostType | APIErrorResult>,
) => {
  const createdPostResult = await postsService.createPost(req.body);

  if (createdPostResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(createdPostResult.status))
      .json(extensionResultToAPIError(createdPostResult.extensions))
    return
  }

  const createdPost = await postsQueryRepository.findById(createdPostResult.data);
  res.status(HttpStatus.Created).json(createdPost!);
};

export { createPost };

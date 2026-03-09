import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputPostType, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { postsQueryRepository, postsService } from '../../../../compositionRoot';

const createPostHandler = async (
  req: RequestWithBody<InputPostType>,
  res: Response<ViewPostType | APIErrorResult>,
) => {
  const createdPostResult = await postsService.createPost(req.body);

  if (isWrongResult(createdPostResult)) {
    sendHttpResponseIfWrongResult(createdPostResult, res);
    return;
  }

  const createdPost = await postsQueryRepository.findById(createdPostResult.data);
  res.status(HttpStatus.Created).json(createdPost!);
};

export { createPostHandler };

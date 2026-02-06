import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/postsService';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';

const deletePost = async (req: RequestWithParams<PostIdParamType>, res: Response) => {
  const deletePostResult = await postsService.deletePost(req.params.id);

  if (deletePostResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(deletePostResult.status))
      .json(extensionResultToAPIError(deletePostResult.extensions))
    return
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deletePost };

import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { postsService } from '../../../../compositionRoot';

const deletePostHandler = async (req: RequestWithParams<PostIdParamType>, res: Response) => {
  const deletePostResult = await postsService.deletePost(req.params.id);

  if (isWrongResult(deletePostResult)) {
    sendHttpResponseIfWrongResult(deletePostResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deletePostHandler };

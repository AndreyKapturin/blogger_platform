import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { blogsService } from '../../../../compositionRoot';

const deleteBlogHandler = async (req: RequestWithParams<BlogIdParamType>, res: Response) => {
  const deleteBlogResult = await blogsService.deleteBlog(req.params.id);

  if (isWrongResult(deleteBlogResult)) {
    sendHttpResponseIfWrongResult(deleteBlogResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deleteBlogHandler };

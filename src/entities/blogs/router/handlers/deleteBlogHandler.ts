import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/blogsService';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';

const deleteBlogHandler = async (req: RequestWithParams<BlogIdParamType>, res: Response) => {
  const deleteBlogResult = await blogsService.deleteBlog(req.params.id);

  if (deleteBlogResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(deleteBlogResult.status))
      .json(extensionResultToAPIError(deleteBlogResult.extensions))
    return
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deleteBlogHandler };

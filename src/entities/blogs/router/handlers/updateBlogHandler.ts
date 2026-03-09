import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { BlogIdParamType, InputBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { blogsService } from '../../../../compositionRoot';

const updateBlogHandler = async (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogType>,
  res: Response,
) => {
  const updateBlogResult = await blogsService.updateBlog(req.params.id, req.body);

  if (isWrongResult(updateBlogResult)) {
    sendHttpResponseIfWrongResult(updateBlogResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { updateBlogHandler };

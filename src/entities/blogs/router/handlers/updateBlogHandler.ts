import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { BlogIdParamType, InputBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/blogsService';

const updateBlogHandler = async (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogType>,
  res: Response,
) => {
  const wasUpdated = await blogsService.updateBlog(req.params.id, req.body);
  res.sendStatus(wasUpdated ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { updateBlogHandler };

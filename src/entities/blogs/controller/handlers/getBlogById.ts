import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogToViewMapper } from '../utils/blogToViewMapper';
import { blogsService } from '../../application/service';

const getBlogById = async (req: RequestWithParams<BlogIdParamType>, res: Response<ViewBlogType>) => {
  const foundBlog = await blogsService.getBlogById(req.params.id);
  if (!foundBlog) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(blogToViewMapper(foundBlog));
};

export { getBlogById };

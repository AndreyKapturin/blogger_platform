import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsQueryRepository } from '../../repositories/blogsQueryRepository';

const getBlogById = async (req: RequestWithParams<BlogIdParamType>, res: Response<ViewBlogType>) => {
  const foundBlog = await blogsQueryRepository.findById(req.params.id);
  if (!foundBlog) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(foundBlog);
};

export { getBlogById };

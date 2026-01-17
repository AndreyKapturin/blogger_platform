import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType, BlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogToViewMapper } from '../utils/blogToViewMapper';
import { blogsRepository } from '../../repository/blogsRepository';

const getBlogById = async (req: RequestWithParams<BlogIdParamType>, res: Response<BlogType>) => {
  const foundBlog = await blogsRepository.findById(req.params.id);
  if (!foundBlog) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(blogToViewMapper(foundBlog));
};

export { getBlogById };

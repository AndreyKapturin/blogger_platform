import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputBlogType, ViewBlogType } from '../../types';
import { blogToViewMapper } from '../mappers/blogToViewMapper';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/service';

const createBlog = async (req: RequestWithBody<InputBlogType>, res: Response<ViewBlogType>) => {
  const createdBlog = await blogsService.createBlog(req.body);
  res.status(HttpStatus.Created).json(blogToViewMapper(createdBlog));
};

export { createBlog };

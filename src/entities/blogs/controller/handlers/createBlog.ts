import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputBlogType, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/service';
import { blogsQueryRepository } from '../../repositories/blogsQueryRepository';

const createBlog = async (req: RequestWithBody<InputBlogType>, res: Response<ViewBlogType>) => {
  const createdBlogId = await blogsService.createBlog(req.body);
  const blog = await blogsQueryRepository.findById(createdBlogId);
  res.status(HttpStatus.Created).json(blog!);
};

export { createBlog };

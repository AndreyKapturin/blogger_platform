import { Request, Response } from 'express';
import { ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogToViewMapper } from '../utils/blogToViewMapper';
import { blogsService } from '../../application/service';

const getBlogs = async (req: Request, res: Response<ViewBlogType[]>) => {
  const blogs = await blogsService.getBlogs();
  res.status(HttpStatus.Ok).json(blogs.map(blogToViewMapper));
};

export { getBlogs };

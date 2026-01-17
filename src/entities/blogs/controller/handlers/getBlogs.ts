import { Request, Response } from 'express';
import { BlogType } from '../../types';
import { blogsRepository } from '../../repository/blogsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogToViewMapper } from '../utils/blogToViewMapper';

const getBlogs = async (req: Request, res: Response<BlogType[]>) => {
  const blogs = await blogsRepository.findAll();
  res.status(HttpStatus.Ok).json(blogs.map(blogToViewMapper));
};

export { getBlogs };

import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { BlogType, InputBlogType, ViewBlogType } from '../../types';
import { blogToViewMapper } from '../utils/blogToViewMapper';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsRepository } from '../../repository/blogsRepository';

const createBlog = async (req: RequestWithBody<InputBlogType>, res: Response<ViewBlogType>) => {
  const newBlog: BlogType = {
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  };
  const createdBlog = await blogsRepository.save(newBlog);
  res.status(HttpStatus.Created).json(blogToViewMapper(createdBlog));
};

export { createBlog };

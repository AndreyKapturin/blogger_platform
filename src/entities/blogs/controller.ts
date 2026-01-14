import { Request, Response } from 'express';
import { BlogIdParamType, BlogType, InputBlogType } from './types';
import { blogsRepository } from './repository';
import { HttpStatus } from '../../core/types/HttpStatus';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from '../../core/types/RequestTypes';

const getBlogs = (req: Request, res: Response<BlogType[]>) => {
  const blogs = blogsRepository.fildAll();
  res.status(HttpStatus.Ok).json(blogs);
};

const getBlogById = (req: RequestWithParams<BlogIdParamType>, res: Response<BlogType>) => {
  const foundBlog = blogsRepository.findById(req.params.id);
  if (!foundBlog) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(foundBlog);
};

const createBlog = (req: RequestWithBody<InputBlogType>, res: Response<BlogType>) => {
  const newBlog: BlogType = {
    id: crypto.randomUUID().toString(),
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
  };
  const createdBlog = blogsRepository.save(newBlog);
  res.status(HttpStatus.Created).json(createdBlog);
};

const updateBlog = (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogType>,
  res: Response
) => {
  const foundBlog = blogsRepository.findById(req.params.id);
  if (!foundBlog) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  const updatedBlog: BlogType = {
    id: foundBlog.id,
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
  };
  blogsRepository.update(updatedBlog);
  res.sendStatus(HttpStatus.No_Content);
};

const deleteBlog = (req: RequestWithParams<BlogIdParamType>, res: Response) => {
  const wasDeleted = blogsRepository.remove(req.params.id);
  res.sendStatus(wasDeleted ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

const blogsController = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};

export { blogsController };

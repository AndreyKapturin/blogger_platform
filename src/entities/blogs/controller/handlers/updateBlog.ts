import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { BlogIdParamType, InputBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsRepository } from '../../repository/blogsRepository';

const updateBlog = async (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogType>,
  res: Response
) => {
  const updatedBlog: InputBlogType = {
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
  };
  const wasUpdated = await blogsRepository.update(req.params.id, updatedBlog);
  res.sendStatus(wasUpdated ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { updateBlog };

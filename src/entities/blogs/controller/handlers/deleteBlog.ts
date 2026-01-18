import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType } from '../../types';
import { blogsRepository } from '../../repository/blogsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsRepository } from '../../../posts/repository/postsRepository';

const deleteBlog = async (req: RequestWithParams<BlogIdParamType>, res: Response) => {
  const wasDeleted = await blogsRepository.remove(req.params.id);
  if (wasDeleted) {
    await postsRepository.removeRelated(req.params.id);
  }
  res.sendStatus(wasDeleted ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { deleteBlog };

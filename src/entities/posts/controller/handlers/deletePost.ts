import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType } from '../../types';
import { postsRepository } from '../../repository/postsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const deletePost = async (req: RequestWithParams<PostIdParamType>, res: Response) => {
  const wasDeleted = await postsRepository.remove(req.params.id);
  res.sendStatus(wasDeleted ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { deletePost };

import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsQueryRepository } from '../../repositories/postsQueryRepository';

const getPostById = async (
  req: RequestWithParams<PostIdParamType>,
  res: Response<ViewPostType>,
) => {
  // QUESTION #1
  const foundPost = await postsQueryRepository.findById(req.params.id);
  if (!foundPost) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(foundPost);
};

export { getPostById };

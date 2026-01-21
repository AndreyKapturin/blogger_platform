import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType, ViewPostType } from '../../types';
import { postsRepository } from '../../repository/postsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postToViewMapper } from '../utils/postToViewMapper';

const getPostById = async (
  req: RequestWithParams<PostIdParamType>,
  res: Response<ViewPostType>,
) => {
  const foundPost = await postsRepository.findById(req.params.id);
  if (!foundPost) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(postToViewMapper(foundPost));
};

export { getPostById };

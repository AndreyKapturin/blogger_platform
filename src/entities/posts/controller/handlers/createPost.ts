import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputPostType, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postToViewMapper } from '../mappers/postToViewMapper';
import { postsService } from '../../application/service';

const createPost = async (
  req: RequestWithBody<InputPostType>,
  res: Response<ViewPostType>,
) => {
  const createdPost = await postsService.createPost(req.body);
  res.status(HttpStatus.Created).json(postToViewMapper(createdPost));
};

export { createPost };

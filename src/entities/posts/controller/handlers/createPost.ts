import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputPostType, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/postsService';
import { postsQueryRepository } from '../../repositories/postsQueryRepository';

const createPost = async (
  req: RequestWithBody<InputPostType>,
  res: Response<ViewPostType>,
) => {
  const createdPostId = await postsService.createPost(req.body);
  const createdPost = await postsQueryRepository.findById(createdPostId);
  res.status(HttpStatus.Created).json(createdPost!);
};

export { createPost };

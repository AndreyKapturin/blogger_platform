import { Request, Response } from 'express';
import { ViewPostType } from '../../types';
import { postsRepository } from '../../repository/postsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postToViewMapper } from '../utils/postToViewMapper';

const getPosts = async (req: Request, res: Response<ViewPostType[]>) => {
  const posts = await postsRepository.findAll();
  res.status(HttpStatus.Ok).json(posts.map(postToViewMapper));
};

export { getPosts };

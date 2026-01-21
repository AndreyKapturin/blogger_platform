import { Request, Response } from 'express';
import { ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postToViewMapper } from '../utils/postToViewMapper';
import { postsService } from '../../application/service';

const getPosts = async (req: Request, res: Response<ViewPostType[]>) => {
  const posts = await postsService.getPosts();
  res.status(HttpStatus.Ok).json(posts.map(postToViewMapper));
};

export { getPosts };

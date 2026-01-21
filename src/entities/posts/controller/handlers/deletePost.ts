import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsService } from '../../application/service';

const deletePost = async (req: RequestWithParams<PostIdParamType>, res: Response) => {
  const wasDeleted = await postsService.deletePost(req.params.id);
  res.sendStatus(wasDeleted ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { deletePost };

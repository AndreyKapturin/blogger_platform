import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { BlogIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/service';

const deleteBlog = async (req: RequestWithParams<BlogIdParamType>, res: Response) => {
  const wasDeleted = await blogsService.deleteBlog(req.params.id);
  res.sendStatus(wasDeleted ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { deleteBlog };

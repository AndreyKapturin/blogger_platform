import { Response } from 'express';
import { RequestWithParamsAndQuery } from '../../../../core/types/RequestTypes';
import { ViewCommentsQuery, ViewCommentType } from '../../../comments/types';
import { PostIdParamType } from '../../types';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { commentsQueryRepository, postsCommandRepository } from '../../../../compositionRoot';

const getPostCommentsHandler = async (
  req: RequestWithParamsAndQuery<PostIdParamType, ViewCommentsQuery>,
  res: Response<Paginator<ViewCommentType>>,
) => {
  const postId = req.params.id;
  const cleanQuery = matchedData(req, { locations: ['query'] }) as ViewCommentsQuery;

  const postExist = await postsCommandRepository.checkById(postId);

  if (!postExist) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }

  const paginatedViewComments = await commentsQueryRepository.findAllForPostWithPagination(
    postId,
    cleanQuery,
  );

  res.status(HttpStatus.Ok).json(paginatedViewComments);
};

export { getPostCommentsHandler };

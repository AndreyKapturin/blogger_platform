import { Response } from 'express';
import { ViewPostQuery, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { RequestWithQuery } from '../../../../core/types/RequestTypes';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';
import { postsQueryRepository } from '../../../../compositionRoot';

const getPostsHandler = async (
  req: RequestWithQuery<ViewPostQuery>,
  res: Response<Paginator<ViewPostType>>,
) => {
  const cleanQuery = matchedData<ViewPostQuery>(req, { locations: ['query'] });
  const paginateViewPosts = await postsQueryRepository.findAllWithPagination(cleanQuery);
  res.status(HttpStatus.Ok).json(paginateViewPosts);
};

export { getPostsHandler };

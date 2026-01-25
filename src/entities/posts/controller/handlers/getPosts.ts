import { Response } from 'express';
import { ViewPostQuery, ViewPostType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postToViewMapper } from '../mappers/postToViewMapper';
import { postsService } from '../../application/service';
import { RequestWithQuery } from '../../../../core/types/RequestTypes';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';
import { toPaginateMapper } from '../../../../core/mappers/toPaginateMapper';

const getPosts = async (
  req: RequestWithQuery<ViewPostQuery>,
  res: Response<Paginator<ViewPostType>>,
) => {
  const cleanQuery = matchedData<ViewPostQuery>(req, {
    locations: ['query'],
  });
  const { items, totalCount } = await postsService.getPosts(cleanQuery);
  const viewPosts = items.map(postToViewMapper);
  const paginatePosts = toPaginateMapper(viewPosts, cleanQuery, totalCount);
  res.status(HttpStatus.Ok).json(paginatePosts);
};

export { getPosts };

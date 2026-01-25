import { Response } from 'express';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { RequestWithParamsAndQuery } from '../../../../core/types/RequestTypes';
import { ViewPostQuery, ViewPostType } from '../../../posts/types';
import { blogsService } from '../../application/service';
import { BlogIdParamType } from '../../types';
import { postsService } from '../../../posts/application/service';
import { matchedData } from 'express-validator';
import { postToViewMapper } from '../../../posts/controller/mappers/postToViewMapper';
import { toPaginateMapper } from '../../../../core/mappers/toPaginateMapper';

const getPostsOfBlog = async (
  req: RequestWithParamsAndQuery<BlogIdParamType, ViewPostQuery>,
  res: Response<Paginator<ViewPostType>>,
) => {
  const cleanQuery = matchedData<ViewPostQuery>(req, { locations: ['query'] });
  const { items, totalCount } = await postsService.getPostsForBlog(req.params.id, cleanQuery);
  const viewPosts = items.map(postToViewMapper);
  const paginatePosts = toPaginateMapper(viewPosts, cleanQuery, totalCount);
  res.status(HttpStatus.Ok).json(paginatePosts);
};

export { getPostsOfBlog };

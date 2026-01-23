import { Response } from 'express';
import { ViewBlogQuery, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/service';
import { matchedData } from 'express-validator';
import { RequestWithQuery } from '../../../../core/types/RequestTypes';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { blogsToPaginator } from '../utils/blogsToPaginator';

const getBlogs = async (
  req: RequestWithQuery<ViewBlogQuery>,
  res: Response<Paginator<ViewBlogType>>,
) => {
  const cleanQuery = matchedData<ViewBlogQuery>(req, {
    locations: ['query'],
  });
  const { items, totalCount } = await blogsService.getBlogs(cleanQuery);
  const paginatedViewBlogs = blogsToPaginator(items, cleanQuery, totalCount);
  res.status(HttpStatus.Ok).json(paginatedViewBlogs);
};

export { getBlogs };

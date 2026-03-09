import { Response } from 'express';
import { ViewBlogQuery, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { matchedData } from 'express-validator';
import { RequestWithQuery } from '../../../../core/types/RequestTypes';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { blogsQueryRepository } from '../../../../compositionRoot';

const getBlogsHandler = async (
  req: RequestWithQuery<ViewBlogQuery>,
  res: Response<Paginator<ViewBlogType>>,
) => {
  const cleanQuery = matchedData<ViewBlogQuery>(req, { locations: ['query'] });
  const paginatedViewBlogs = await blogsQueryRepository.findAllWithPagination(cleanQuery);
  res.status(HttpStatus.Ok).json(paginatedViewBlogs);
};

export { getBlogsHandler };

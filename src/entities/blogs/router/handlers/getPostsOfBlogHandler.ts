import { Response } from 'express';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { RequestWithParamsAndQuery } from '../../../../core/types/RequestTypes';
import { ViewPostQuery, ViewPostType } from '../../../posts/types';
import { BlogIdParamType } from '../../types';
import { matchedData } from 'express-validator';
import { blogsQueryRepository, postsQueryRepository } from '../../../../compositionRoot';

const getPostsOfBlogHandler = async (
  req: RequestWithParamsAndQuery<BlogIdParamType, ViewPostQuery>,
  res: Response<Paginator<ViewPostType>>,
) => {
  const blogId = req.params.id;
  const blog = await blogsQueryRepository.findById(blogId);

  if (!blog) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }

  const cleanQuery = matchedData<ViewPostQuery>(req, { locations: ['query'] });
  const paginatedViewPosts = await postsQueryRepository.findAllForBlogWithPagination(blogId, cleanQuery);
  res.status(HttpStatus.Ok).json(paginatedViewPosts);
};

export { getPostsOfBlogHandler };

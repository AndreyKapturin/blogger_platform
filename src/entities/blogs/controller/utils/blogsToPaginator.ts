import { WithId } from 'mongodb';
import { Paginator } from '../../../../core/types/Pagination';
import { BlogType, ViewBlogQuery, ViewBlogType } from '../../types';
import { blogToViewMapper } from './blogToViewMapper';

const _calcPagesCount = (pageSize: number, totalCount: number): number => {
  return Math.ceil(totalCount / pageSize) || 1;
};

const blogsToPaginator = (
  mongoBlogs: WithId<BlogType>[],
  query: ViewBlogQuery,
  totalCount: number,
): Paginator<ViewBlogType> => {
  return {
    pagesCount: _calcPagesCount(query.pageSize, totalCount),
    totalCount,
    pageSize: query.pageSize,
    page: query.pageNumber,
    items: mongoBlogs.map(blogToViewMapper),
  };
};

export { blogsToPaginator };

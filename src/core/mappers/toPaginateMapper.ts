import { PaginationQuery, Paginator } from '../types/PaginationAndSorting';

const _calcPagesCount = (pageSize: number, totalCount: number): number => {
  return Math.ceil(totalCount / pageSize) || 1;
};

const toPaginateMapper = <T>(
  items: T[],
  query: PaginationQuery,
  totalCount: number,
): Paginator<T> => {
  return {
    pagesCount: _calcPagesCount(query.pageSize, totalCount),
    totalCount,
    pageSize: query.pageSize,
    page: query.pageNumber,
    items,
  };
};

export { toPaginateMapper };

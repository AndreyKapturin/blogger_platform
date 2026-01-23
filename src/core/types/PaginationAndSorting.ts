enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

type PaginationAndSortQuery<T> = {
  pageNumber: number;
  pageSize: number;
  sortDirection: SortDirection;
  sortBy: T;
};

export { SortDirection };
export type { Paginator, PaginationAndSortQuery };

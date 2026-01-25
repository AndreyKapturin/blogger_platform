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

type PaginationQuery = {
  pageNumber: number;
  pageSize: number;
  sortDirection: SortDirection;
};

type PaginationAndSortQuery<T> = PaginationQuery & {
  sortBy: T;
};

export { SortDirection };
export type { Paginator, PaginationAndSortQuery, PaginationQuery };

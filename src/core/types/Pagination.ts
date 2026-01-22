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
};

export type { Paginator, PaginationQuery };

import { createPaginationAndSortingValidationSchema } from '../../../core/validation/paginatorValidation';
import {
  DEFAULT_BLOG_PAGE_SIZE,
  DEFAULT_BLOG_SORT_BY,
  DEFAULT_BLOG_SORT_DIRECTION,
} from '../constants';
import { BlogSortField } from '../types';

const paginationAndSortingBlogValidationSchema =
  createPaginationAndSortingValidationSchema<BlogSortField>(Object.values(BlogSortField), {
    pageSize: DEFAULT_BLOG_PAGE_SIZE,
    sortDirection: DEFAULT_BLOG_SORT_DIRECTION,
    sortBy: DEFAULT_BLOG_SORT_BY,
  });

export { paginationAndSortingBlogValidationSchema };

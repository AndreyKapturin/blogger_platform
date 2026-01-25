import { createPaginationAndSortingValidationSchema } from '../../../core/validation/paginatorValidation';
import {
  DEFAULT_POSTS_PAGE_SIZE,
  DEFAULT_POSTS_SORT_BY,
  DEFAULT_POSTS_SORT_DIRECTION,
} from '../constants';

import { PostSortField } from '../types';

const paginationAndSortingPostsValidationSchema =
  createPaginationAndSortingValidationSchema<PostSortField>(Object.values(PostSortField), {
    pageSize: DEFAULT_POSTS_PAGE_SIZE,
    sortDirection: DEFAULT_POSTS_SORT_DIRECTION,
    sortBy: DEFAULT_POSTS_SORT_BY,
  });

export { paginationAndSortingPostsValidationSchema };

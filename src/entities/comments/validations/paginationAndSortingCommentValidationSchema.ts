import { createPaginationAndSortingValidationSchema } from '../../../core/validation/paginatorValidation';
import {
  DEFAULT_COMMENT_PAGE_SIZE,
  DEFAULT_COMMENT_SORT_BY,
  DEFAULT_COMMENT_SORT_DIRECTION,
} from '../constants';
import { CommentsSortField } from '../types';

const paginationAndSortingCommentValidationSchema =
  createPaginationAndSortingValidationSchema<CommentsSortField>(Object.values(CommentsSortField), {
    pageSize: DEFAULT_COMMENT_PAGE_SIZE,
    sortDirection: DEFAULT_COMMENT_SORT_DIRECTION,
    sortBy: DEFAULT_COMMENT_SORT_BY,
  });

export { paginationAndSortingCommentValidationSchema };

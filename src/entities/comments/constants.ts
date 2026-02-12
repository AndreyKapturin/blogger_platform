import { SortDirection } from '../../core/types/PaginationAndSorting';
import { CommentsSortField } from './types';

export const MIN_COMMENT_CONTENT_LENGTH = 20;
export const MAX_COMMENT_CONTENT_LENGTH = 300;
export const DEFAULT_COMMENT_PAGE_SIZE = 10;
export const DEFAULT_COMMENT_SORT_BY = CommentsSortField.CreatedAt;
export const DEFAULT_COMMENT_SORT_DIRECTION = SortDirection.Desc;

import { SortDirection } from "../../core/types/PaginationAndSorting";
import { PostSortField } from "./types";

export const MAX_POST_TITLE_LENGTH = 30;
export const MAX_POST_SHORT_DESCRIPTION_LENGTH = 100;
export const MAX_POST_CONTENT_LENGTH = 1000;
export const DEFAULT_POSTS_PAGE_SIZE = 10;
export const DEFAULT_POSTS_SORT_DIRECTION = SortDirection.Desc;
export const DEFAULT_POSTS_SORT_BY = PostSortField.CreatedAt;
import { SortDirection } from "../../core/types/Sorting";
import { BlogSortField } from "./types";

export const MAX_BLOG_NAME_LENGTH = 15;
export const MAX_BLOG_DESCRIPTION_LENGTH = 500;
export const MAX_BLOG_WEBSITE_URL_LENGTH = 100;
export const DEFAULT_BLOG_SORT_BY: BlogSortField = BlogSortField.CreatedAt;
export const DEFAULT_BLOG_SORT_DIRECTION: SortDirection = SortDirection.Desc;
export const DEFAULT_BLOG_PAGE_NUMBER = 1;
export const DEFAULT_BLOG_PAGE_SIZE = 10;
export const DEFAULT_BLOG_SEARCH_NAME_TERM = null;
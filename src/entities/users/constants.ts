import { SortDirection } from "../../core/types/PaginationAndSorting";
import { UsersSortFields } from "./types";

export const MIN_USER_LOGIN_LENGTH = 3;
export const MAX_USER_LOGIN_LENGTH = 10;
export const MIN_USER_PASSWORD_LENGTH = 6;
export const MAX_USER_PASSWORD_LENGTH = 20;

export const DEFAULT_USERS_PAGE_SIZE = 10;
export const DEFAULT_USERS_SORT_DIRECTION = SortDirection.Desc;
export const DEFAULT_USERS_SORT_BY = UsersSortFields.CreatedAt;
export const DEFAULT_USERS_SEARCH_LOGIN_TERM = null;
export const DEFAULT_USERS_SEARCH_EMAIL_TERM = null;
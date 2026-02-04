import { createPaginationAndSortingValidationSchema } from '../../../core/validation/paginatorValidation';
import {
  DEFAULT_USERS_PAGE_SIZE,
  DEFAULT_USERS_SORT_BY,
  DEFAULT_USERS_SORT_DIRECTION,
} from '../constants';
import { UsersSortFields } from '../types';

const paginationAndSortingUsersValidationSchema =
  createPaginationAndSortingValidationSchema<UsersSortFields>(Object.values(UsersSortFields), {
    pageSize: DEFAULT_USERS_PAGE_SIZE,
    sortDirection: DEFAULT_USERS_SORT_DIRECTION,
    sortBy: DEFAULT_USERS_SORT_BY,
  });

export { paginationAndSortingUsersValidationSchema };

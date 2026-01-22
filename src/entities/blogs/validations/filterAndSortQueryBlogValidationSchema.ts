import { checkSchema } from 'express-validator';
import {
  DEFAULT_BLOG_SEARCH_NAME_TERM,
  DEFAULT_BLOG_SORT_BY,
  DEFAULT_BLOG_SORT_DIRECTION,
  MAX_BLOG_NAME_LENGTH,
} from '../constants';
import { SortDirection } from '../../../core/types/Sorting';
import { BlogSortField } from '../types';

const filterAndSortQueryBlogValidationSchema = checkSchema(
  {
    searchNameTerm: {
      default: {
        options: DEFAULT_BLOG_SEARCH_NAME_TERM,
      },
      isLength: {
        options: { max: MAX_BLOG_NAME_LENGTH },
      },
    },
    sortDirection: {
      default: {
        options: DEFAULT_BLOG_SORT_DIRECTION,
      },
      isIn: {
        options: [Object.values(SortDirection)],
      },
    },
    sortBy: {
      default: {
        options: DEFAULT_BLOG_SORT_BY,
      },
      isIn: {
        options: [Object.values(BlogSortField)],
      },
    },
  },
  ['query'],
);

export { filterAndSortQueryBlogValidationSchema };

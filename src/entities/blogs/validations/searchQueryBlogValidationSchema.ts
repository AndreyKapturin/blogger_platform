import { query } from 'express-validator';
import { DEFAULT_BLOG_SEARCH_NAME_TERM, MAX_BLOG_NAME_LENGTH } from '../constants';

const searchQueryBlogValidationSchema = query('searchNameTerm')
  .default(DEFAULT_BLOG_SEARCH_NAME_TERM)
  .isLength({ max: MAX_BLOG_NAME_LENGTH });

export { searchQueryBlogValidationSchema };

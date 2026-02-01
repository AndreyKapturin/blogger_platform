import { query } from 'express-validator';
import {
  DEFAULT_USERS_SEARCH_LOGIN_TERM,
  MAX_USER_LOGIN_LENGTH,
} from '../constants';

const searchQueryUsersValidationSchema = [
  query('searchLoginTerm')
    .default(DEFAULT_USERS_SEARCH_LOGIN_TERM)
    .isLength({ max: MAX_USER_LOGIN_LENGTH }),
  
  query('searchEmailTerm')
    .default(DEFAULT_USERS_SEARCH_LOGIN_TERM)
];

export { searchQueryUsersValidationSchema };

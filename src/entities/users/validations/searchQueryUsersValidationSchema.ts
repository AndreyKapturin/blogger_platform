import { query } from 'express-validator';
import {
  DEFAULT_USERS_SEARCH_LOGIN_TERM,
} from '../constants';

const searchLoginTermValidation = query('searchLoginTerm')
  .default(DEFAULT_USERS_SEARCH_LOGIN_TERM)

const searchEmailTermValidation = query('searchEmailTerm')
  .default(DEFAULT_USERS_SEARCH_LOGIN_TERM)

const searchQueryUsersValidationSchema = [
  searchLoginTermValidation,
  searchEmailTermValidation,
];

export { searchQueryUsersValidationSchema };

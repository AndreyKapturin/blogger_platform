import { Router } from 'express';
import { getUsersHandler } from './handlers/getUsersHandler';
import { paginationAndSortingUsersValidationSchema } from '../validations/paginationAndSortingUsersValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { searchQueryUsersValidationSchema } from '../validations/searchQueryUsersValidationSchema';

const usersRouter = Router();

usersRouter.get(
  '/',
  searchQueryUsersValidationSchema,
  paginationAndSortingUsersValidationSchema,
  validationResultMiddleware,
  getUsersHandler,
);

export { usersRouter };

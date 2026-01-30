import { Router } from 'express';
import { getUsersHandler } from './handlers/getUsersHandler';
import { paginationAndSortingUsersValidationSchema } from '../validations/paginationAndSortingUsersValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { searchQueryUsersValidationSchema } from '../validations/searchQueryUsersValidationSchema';
import { inputUserValidationSchema } from '../validations/inputUserValidationSchema';
import { createUserHandler } from './handlers/createUserHandler';
import { basicAuthMiddleware } from '../../../core/middlewares/basicAuthMiddleware';

const usersRouter = Router();

usersRouter.get(
  '/',
  searchQueryUsersValidationSchema,
  paginationAndSortingUsersValidationSchema,
  validationResultMiddleware,
  getUsersHandler,
);

usersRouter.post('/',
  basicAuthMiddleware,
  inputUserValidationSchema,
  validationResultMiddleware,
  createUserHandler
);

export { usersRouter };

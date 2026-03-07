import { Router } from 'express';
import { getUsersHandler } from './handlers/getUsersHandler';
import { paginationAndSortingUsersValidationSchema } from '../validations/paginationAndSortingUsersValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { searchQueryUsersValidationSchema } from '../validations/searchQueryUsersValidationSchema';
import { inputUserValidationSchema } from '../validations/inputUserValidationSchema';
import { createUserHandler } from './handlers/createUserHandler';
import { deleteUserHandler } from './handlers/deleteUserHandler';
import { basicAuthMiddleware } from '../../../core/middlewares/basicAuthMiddleware';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { Routes } from '../../../app/routes';

const usersRouter = Router();

usersRouter.get(
  Routes.Index,
  basicAuthMiddleware,
  searchQueryUsersValidationSchema,
  paginationAndSortingUsersValidationSchema,
  validationResultMiddleware,
  getUsersHandler,
);

usersRouter.post(
  Routes.Index,
  basicAuthMiddleware,
  inputUserValidationSchema,
  validationResultMiddleware,
  createUserHandler,
);

usersRouter.delete(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deleteUserHandler,
);

export { usersRouter };

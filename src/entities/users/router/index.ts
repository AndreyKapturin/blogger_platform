import { Router } from 'express';
import { paginationAndSortingUsersValidationSchema } from '../validations/paginationAndSortingUsersValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { searchQueryUsersValidationSchema } from '../validations/searchQueryUsersValidationSchema';
import { inputUserValidationSchema } from '../validations/inputUserValidationSchema';
import { basicAuthMiddleware } from '../../../core/middlewares/basicAuthMiddleware';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { Routes } from '../../../app/routes';
import { usersController } from '../../../compositionRoot';

const usersRouter = Router();

usersRouter.get(
  Routes.Index,
  basicAuthMiddleware,
  searchQueryUsersValidationSchema,
  paginationAndSortingUsersValidationSchema,
  validationResultMiddleware,
  usersController.getUsers.bind(usersController),
);

usersRouter.post(
  Routes.Index,
  basicAuthMiddleware,
  inputUserValidationSchema,
  validationResultMiddleware,

  usersController.createUser.bind(usersController),
);

usersRouter.delete(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  usersController.deleteUser.bind(usersController),
);

export { usersRouter };

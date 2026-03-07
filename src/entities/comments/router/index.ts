import { Router } from 'express';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { updateCommentHandler } from './handlers/updateCommentHandler';
import { inputCommentValidationSchema } from '../validations/inputCommentValidationSchema';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { getCommentByIdHandler } from './handlers/getCommentByIdHandler';
import { deleteCommentByIdHandler } from './handlers/deleteCommentByIdHandler';
import { Routes } from '../../../app/routes';

const commentsRouter = Router();

commentsRouter.get(
  Routes.ById(':id'),
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  getCommentByIdHandler,
);

commentsRouter.put(
  Routes.ById(':id'),
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  updateCommentHandler,
);

commentsRouter.delete(
  Routes.ById(':id'),
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deleteCommentByIdHandler,
);

export { commentsRouter };

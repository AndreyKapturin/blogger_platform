import { Router } from 'express';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { updateCommentHandler } from './handlers/updateCommentHandler';
import { inputCommentValidationSchema } from '../validations/inputCommentValidationSchema';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { getCommentByIdHandler } from './handlers/getCommentByIdHandler';
import { deleteCommentByIdHandler } from './handlers/deleteCommentByIdHandler';

const commentsRouter = Router();

commentsRouter.get(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  getCommentByIdHandler
)

commentsRouter.put(
  '/:id',
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  updateCommentHandler
)

commentsRouter.delete(
  '/:id',
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deleteCommentByIdHandler
)

export { commentsRouter };

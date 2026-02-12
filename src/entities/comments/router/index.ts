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
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  bearerAuthMiddlewate,
  updateCommentHandler
)

commentsRouter.delete(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  bearerAuthMiddlewate,
  deleteCommentByIdHandler
)

export { commentsRouter };

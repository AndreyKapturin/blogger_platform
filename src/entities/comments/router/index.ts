import { Router } from 'express';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { updateCommentHandler } from './handlers/updateCommentHandler';
import { inputCommentValidationSchema } from '../validations/inputCommentValidationSchema';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';

const commentsRouter = Router();

commentsRouter.put(
  '/:id',
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  bearerAuthMiddlewate,
  updateCommentHandler
)

export { commentsRouter };

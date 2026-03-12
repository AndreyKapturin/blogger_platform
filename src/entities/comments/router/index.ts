import { Router } from 'express';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { inputCommentValidationSchema } from '../validations/inputCommentValidationSchema';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { Routes } from '../../../app/routes';
import { commentsController } from '../../../compositionRoot';

const commentsRouter = Router();

commentsRouter.get(
  Routes.ById(':id'),
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  commentsController.getCommentById.bind(commentsController),
);

commentsRouter.put(
  Routes.ById(':id'),
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  commentsController.updateComment.bind(commentsController),
);

commentsRouter.delete(
  Routes.ById(':id'),
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  commentsController.deleteCommentById.bind(commentsController),
);

export { commentsRouter };

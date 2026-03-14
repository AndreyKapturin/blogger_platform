import { Router } from 'express';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { inputCommentValidationSchema } from '../validations/inputCommentValidationSchema';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { Routes } from '../../../app/routes';
import { container } from '../../../compositionRoot';
import { CommentsController } from '../controller/CommentsController';

const commentsController = container.get(CommentsController);

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

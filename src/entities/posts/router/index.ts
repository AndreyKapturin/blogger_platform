import { Router } from 'express';
import {
  inputPostValidationSchema,
  paginationAndSortingPostsValidationSchema,
} from '../validations';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { basicAuthMiddleware } from '../../../core/middlewares/basicAuthMiddleware';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { createPostHandler } from './handlers/createPostHandler';
import { deletePostHandler } from './handlers/deletePostHandler';
import { getPostByIdHandler } from './handlers/getPostByIdHandler';
import { getPostsHandler } from './handlers/getPostsHandler';
import { updatePostHandler } from './handlers/updatePostHandler';
import { inputCommentValidationSchema } from '../../comments/validations/inputCommentValidationSchema';
import { createPostCommentHandler } from './handlers/createPostCommentHandler';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { getPostCommentsHandler } from './handlers/getPostCommentsHandler';
import { paginationAndSortingCommentValidationSchema } from '../../comments/validations/paginationAndSortingCommentValidationSchema';
import { Routes } from '../../../app/routes';

const postsRouter = Router();

postsRouter.get(
  Routes.Index,
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  getPostsHandler,
);

postsRouter.get(
  Routes.ById(':id'),
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  getPostByIdHandler,
);

postsRouter.get(
  Routes.PostIdComments(':id'),
  idInParamsCheckMiddleware,
  paginationAndSortingCommentValidationSchema,
  validationResultMiddleware,
  getPostCommentsHandler,
);

postsRouter.post(
  Routes.Index,
  basicAuthMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  createPostHandler,
);

postsRouter.post(
  Routes.PostIdComments(':id'),
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  createPostCommentHandler,
);

postsRouter.put(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  updatePostHandler,
);

postsRouter.delete(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deletePostHandler,
);

export { postsRouter };

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

const postsRouter = Router();

postsRouter.get(
  '/',
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  getPostsHandler,
);

postsRouter.get(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  getPostByIdHandler,
);

postsRouter.get(
  '/:id/comments',
  idInParamsCheckMiddleware,
  paginationAndSortingCommentValidationSchema,
  validationResultMiddleware,
  getPostCommentsHandler,
);

postsRouter.post(
  '/',
  basicAuthMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  createPostHandler,
);

postsRouter.post(
  '/:id/comments',
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  createPostCommentHandler,
);

postsRouter.put(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  updatePostHandler,
);

postsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deletePostHandler,
);

export { postsRouter };

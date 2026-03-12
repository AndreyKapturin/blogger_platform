import { Router } from 'express';
import {
  inputPostValidationSchema,
  paginationAndSortingPostsValidationSchema,
} from '../validations';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { basicAuthMiddleware } from '../../../core/middlewares/basicAuthMiddleware';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { inputCommentValidationSchema } from '../../comments/validations/inputCommentValidationSchema';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { paginationAndSortingCommentValidationSchema } from '../../comments/validations/paginationAndSortingCommentValidationSchema';
import { Routes } from '../../../app/routes';
import { postsController } from '../../../compositionRoot';

const postsRouter = Router();

postsRouter.get(
  Routes.Index,
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  postsController.getPosts.bind(postsController),
);

postsRouter.get(
  Routes.ById(':id'),
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  postsController.getPostById.bind(postsController),
);

postsRouter.get(
  Routes.PostIdComments(':id'),
  idInParamsCheckMiddleware,
  paginationAndSortingCommentValidationSchema,
  validationResultMiddleware,
  postsController.getPostComments.bind(postsController),
);

postsRouter.post(
  Routes.Index,
  basicAuthMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.createPost.bind(postsController),
);

postsRouter.post(
  Routes.PostIdComments(':id'),
  bearerAuthMiddlewate,
  idInParamsCheckMiddleware,
  inputCommentValidationSchema,
  validationResultMiddleware,
  postsController.createPostComment.bind(postsController),
);

postsRouter.put(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.updatePost.bind(postsController),
);

postsRouter.delete(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  postsController.deletePost.bind(postsController),
);

export { postsRouter };

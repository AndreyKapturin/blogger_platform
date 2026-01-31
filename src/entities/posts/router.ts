import { Router } from 'express';
import { postsController } from './controller';
import {
  inputPostValidationSchema,
  paginationAndSortingPostsValidationSchema,
} from './validations';
import { validationResultMiddleware } from '../../core/middlewares/validationMiddleware';
import { basicAuthMiddleware } from '../../core/middlewares/basicAuthMiddleware';
import { idInParamsCheckMiddleware } from '../../core/validation/idInParamsCheckMiddleware';

const postsRouter = Router();

postsRouter.get(
  '/',
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  postsController.getPosts,
);

postsRouter.get(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  postsController.getPostById,
);

postsRouter.post(
  '/',
  basicAuthMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.createPost,
);

postsRouter.put(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.updatePost,
);

postsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  postsController.deletePost,
);

export { postsRouter };

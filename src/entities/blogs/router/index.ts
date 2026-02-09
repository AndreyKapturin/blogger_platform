import { Router } from 'express';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import {
  inputBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  searchQueryBlogValidationSchema,
} from '../validations';
import { basicAuthMiddleware } from '../../../core/middlewares/basicAuthMiddleware';
import { paginationAndSortingPostsValidationSchema } from '../../posts/validations';
import { inputBlogPostValidationSchema } from '../../posts/validations/inputBlogPostValidationSchema';
import { idInParamsCheckMiddleware } from '../../../core/validation/idInParamsCheckMiddleware';
import { createBlogHandler } from './handlers/createBlogHandler';
import { createPostForBlogHandler } from './handlers/createPostForBlogHandler';
import { deleteBlogHandler } from './handlers/deleteBlogHandler';
import { getBlogByIdHandler } from './handlers/getBlogByIdHandler';
import { getBlogsHandler } from './handlers/getBlogsHandler';
import { getPostsOfBlogHandler } from './handlers/getPostsOfBlogHandler';
import { updateBlogHandler } from './handlers/updateBlogHandler';

const blogsRouter = Router();

blogsRouter.get(
  '/',
  searchQueryBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  validationResultMiddleware,
  getBlogsHandler,
);

blogsRouter.get(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  getBlogByIdHandler
);

blogsRouter.get(
  '/:id/posts',
  idInParamsCheckMiddleware,
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  getPostsOfBlogHandler,
);

blogsRouter.post(
  '/',
  basicAuthMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  createBlogHandler,
);

blogsRouter.post(
  '/:id/posts',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogPostValidationSchema,
  validationResultMiddleware,
  createPostForBlogHandler,
);

blogsRouter.put(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  updateBlogHandler,
);

blogsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deleteBlogHandler,
);

export { blogsRouter };

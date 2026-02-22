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
import { Routes } from '../../../app/routes';

const blogsRouter = Router();

blogsRouter.get(
  Routes.Index,
  searchQueryBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  validationResultMiddleware,
  getBlogsHandler,
);

blogsRouter.get(
  Routes.ById(':id'),
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  getBlogByIdHandler
);

blogsRouter.get(
  Routes.BlogIdPosts(':id'),
  idInParamsCheckMiddleware,
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  getPostsOfBlogHandler,
);

blogsRouter.post(
  Routes.Index,
  basicAuthMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  createBlogHandler,
);

blogsRouter.post(
  Routes.BlogIdPosts(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogPostValidationSchema,
  validationResultMiddleware,
  createPostForBlogHandler,
);

blogsRouter.put(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  updateBlogHandler,
);

blogsRouter.delete(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  deleteBlogHandler,
);

export { blogsRouter };

import { Router } from 'express';
import { validationResultMiddleware } from '../../core/middlewares/validationMiddleware';
import {
  inputBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  searchQueryBlogValidationSchema,
  idInParamsCheckMiddleware,
} from './validations';
import { blogsController } from './controller';
import { basicAuthMiddleware } from '../../core/middlewares/basicAuthMiddleware';
import { paginationAndSortingPostsValidationSchema } from '../posts/validations';

const blogsRouter = Router();

blogsRouter.get(
  '/',
  searchQueryBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  validationResultMiddleware,
  blogsController.getBlogs,
);
blogsRouter.get(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  blogsController.getBlogById,
);
blogsRouter.get(
  '/:id/posts',
  idInParamsCheckMiddleware,
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  blogsController.getPostsOfBlog,
);
blogsRouter.post(
  '/',
  basicAuthMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.createBlog,
);
blogsRouter.put(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.updateBlog,
);
blogsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  blogsController.deleteBlog,
);

export { blogsRouter };

import { Router } from 'express';
import { validationResultMiddleware } from '../../core/middlewares/validationMiddleware';
import {
  inputBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  searchQueryBlogValidationSchema,
} from './validations';
import { idInParamsCheckMiddleware } from './validations/idInParamsCheckMiddleware';
import { blogsController } from './controller';
import { basicAuthMiddleware } from '../../core/middlewares/basicAuthMiddleware';

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

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
import { Routes } from '../../../app/routes';
import { blogsController } from '../../../compositionRoot';

const blogsRouter = Router();

blogsRouter.get(
  Routes.Index,
  searchQueryBlogValidationSchema,
  paginationAndSortingBlogValidationSchema,
  validationResultMiddleware,
  blogsController.getBlogs.bind(blogsController),
);

blogsRouter.get(
  Routes.ById(':id'),
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  blogsController.getBlogById.bind(blogsController),
);

blogsRouter.get(
  Routes.BlogIdPosts(':id'),
  idInParamsCheckMiddleware,
  paginationAndSortingPostsValidationSchema,
  validationResultMiddleware,
  blogsController.getPostsOfBlog.bind(blogsController),
);

blogsRouter.post(
  Routes.Index,
  basicAuthMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.createBlog.bind(blogsController),
);

blogsRouter.post(
  Routes.BlogIdPosts(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogPostValidationSchema,
  validationResultMiddleware,
  blogsController.createPostForBlog.bind(blogsController),
);

blogsRouter.put(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.updateBlog.bind(blogsController),
);

blogsRouter.delete(
  Routes.ById(':id'),
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  blogsController.deleteBlog.bind(blogsController),
);

export { blogsRouter };

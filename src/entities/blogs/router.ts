import { Router } from 'express';
import { validationResultMiddleware } from '../../core/validation/validationMiddleware';
import { idInParamsCheckMiddleware, inputBlogValidationSchema } from './validations';
import { blogsController } from './controller';
import { basicAuthMiddleware } from '../../core/middlewares/basicAuthMiddleware';

const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get(
  '/:id',
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  blogsController.getBlogById
);
blogsRouter.post(
  '/',
  basicAuthMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.createBlog
);
blogsRouter.put(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.updateBlog
);
blogsRouter.delete(
  '/:id',
  basicAuthMiddleware,
  idInParamsCheckMiddleware,
  validationResultMiddleware,
  blogsController.deleteBlog
);

export { blogsRouter };

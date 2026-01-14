import { Router } from 'express';
import { blogsController } from './controller';
import { validationResultMiddleware } from '../../core/validation/validationMiddleware';
import { inputBlogValidationSchema } from './validations';
import { basicAuthMiddleware } from '../../core/middlewares/basicAuthMiddleware';

const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get('/:id', blogsController.getBlogById);
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
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.updateBlog
);
blogsRouter.delete('/:id', basicAuthMiddleware, blogsController.deleteBlog);

export { blogsRouter };

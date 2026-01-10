import { Router } from 'express';
import { blogsController } from './controller';
import { validationResultMiddleware } from '../../core/validation/validationMiddleware';
import { inputBlogValidationSchema } from './validations';

const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get('/:id', blogsController.getBlogById);
blogsRouter.post(
  '/',
  inputBlogValidationSchema,
  validationResultMiddleware,
  blogsController.createBlog
);
blogsRouter.put('/:id', blogsController.updateBlog);
blogsRouter.delete('/:id', blogsController.deleteBlog);

export { blogsRouter };

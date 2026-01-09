import { Router } from 'express';
import { blogsController } from './controller';

const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get('/:id', blogsController.getBlogById);
blogsRouter.post('/', blogsController.createBlog);
blogsRouter.put('/:id', blogsController.updateBlog);
blogsRouter.delete('/:id', blogsController.deleteBlog);

export { blogsRouter };

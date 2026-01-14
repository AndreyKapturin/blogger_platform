import { Router } from 'express';
import { postsController } from './controller';
import { inputPostValidationSchema } from './validations';
import { validationResultMiddleware } from '../../core/validation/validationMiddleware';

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.get('/:id', postsController.getPostById);
postsRouter.post(
  '/',
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.createPost
);
postsRouter.put(
  '/:id',
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.updatePost
);
postsRouter.delete('/:id', postsController.deletePost);

export { postsRouter };

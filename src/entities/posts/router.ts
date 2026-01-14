import { Router } from 'express';
import { postsController } from './controller';
import { inputPostValidationSchema } from './validations';
import { validationResultMiddleware } from '../../core/validation/validationMiddleware';
import { basicAuthMiddleware } from '../../core/middlewares/basicAuthMiddleware';

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.get('/:id', postsController.getPostById);
postsRouter.post(
  '/',
  basicAuthMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.createPost
);
postsRouter.put(
  '/:id',
  basicAuthMiddleware,
  inputPostValidationSchema,
  validationResultMiddleware,
  postsController.updatePost
);
postsRouter.delete('/:id', basicAuthMiddleware, postsController.deletePost);

export { postsRouter };

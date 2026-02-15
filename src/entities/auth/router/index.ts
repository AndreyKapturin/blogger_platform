import { Router } from 'express';
import { loginHandler } from './handlers/loginHandler';
import { loginOrEmailValidation } from '../validations/loginValidation';
import { inputUserValidationSchema, passwordValidationSchema } from '../../users/validations/inputUserValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { meHandler } from './handlers/meHandler';
import { registrationHandler } from './handlers/registrationHandler';

const authRouter = Router();

authRouter.get(
  '/me',
  bearerAuthMiddlewate,
  meHandler,
);

authRouter.post(
  '/login',
  loginOrEmailValidation,
  passwordValidationSchema,
  validationResultMiddleware,
  loginHandler,
);

authRouter.post(
  '/registration',
  inputUserValidationSchema,
  validationResultMiddleware,
  registrationHandler,
);

export { authRouter };

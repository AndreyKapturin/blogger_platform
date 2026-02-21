import { Router } from 'express';
import { loginHandler } from './handlers/loginHandler';
import { loginOrEmailValidation } from '../validations/loginValidation';
import { emailValidationSchema, inputUserValidationSchema, passwordValidationSchema } from '../../users/validations/inputUserValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { meHandler } from './handlers/meHandler';
import { registrationHandler } from './handlers/registrationHandler';
import { emailResendingHandler } from './handlers/emailResendingHandler';
import { emailConfirmationCodeValidation } from '../validations/emailConfirmationCodeValidation';
import { registrationConfirmationHandler } from './handlers/registrationConfirmationHandler';
import { refreshTokenMiddleware } from '../../../core/middlewares/refreshTokenMiddleware';
import { refreshTokensHandler } from './handlers/refreshTokensHandler';
import { logoutHandler } from './handlers/logoutHandler';

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

authRouter.post(
  '/registration-email-resending',
  emailValidationSchema,
  validationResultMiddleware,
  emailResendingHandler,
);

authRouter.post(
  '/registration-confirmation',
  emailConfirmationCodeValidation,
  validationResultMiddleware,
  registrationConfirmationHandler,
);

authRouter.post(
  '/refresh-token',
  refreshTokenMiddleware,
  refreshTokensHandler,
);

authRouter.post(
  '/logout',
  refreshTokenMiddleware,
  logoutHandler,
);

export { authRouter };

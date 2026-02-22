import { Router } from 'express';
import { loginHandler } from './handlers/loginHandler';
import { loginOrEmailValidation } from '../validations/loginValidation';
import {
  emailValidationSchema,
  inputUserValidationSchema,
  passwordValidationSchema,
} from '../../users/validations/inputUserValidationSchema';
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
import { Routes } from '../../../app/routes';

const authRouter = Router();

authRouter.get(Routes.Me, bearerAuthMiddlewate, meHandler);

authRouter.post(
  Routes.Login,
  loginOrEmailValidation,
  passwordValidationSchema,
  validationResultMiddleware,
  loginHandler,
);

authRouter.post(
  Routes.Registration,
  inputUserValidationSchema,
  validationResultMiddleware,
  registrationHandler,
);

authRouter.post(
  Routes.EmailResending,
  emailValidationSchema,
  validationResultMiddleware,
  emailResendingHandler,
);

authRouter.post(
  Routes.RegistrationConfirmation,
  emailConfirmationCodeValidation,
  validationResultMiddleware,
  registrationConfirmationHandler,
);

authRouter.post(Routes.RefreshToken, refreshTokenMiddleware, refreshTokensHandler);

authRouter.post(Routes.Logout, refreshTokenMiddleware, logoutHandler);

export { authRouter };

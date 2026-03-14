import { Router } from 'express';
import { loginOrEmailValidation } from '../validations/loginValidation';
import {
  emailValidationSchema,
  inputUserValidationSchema,
  passwordValidationSchema,
} from '../../users/validations/inputUserValidationSchema';
import { validationResultMiddleware } from '../../../core/middlewares/validationMiddleware';
import { bearerAuthMiddlewate } from '../../../core/middlewares/bearerAuthMiddlewate';
import { emailConfirmationCodeValidation } from '../validations/emailConfirmationCodeValidation';
import { refreshTokenMiddleware } from '../../../core/middlewares/refreshTokenMiddleware';
import { Routes } from '../../../app/routes';
import { rateLimitMiddleware } from '../../../core/middlewares/rateLimitMiddleware';
import { container } from '../../../compositionRoot';
import { inputNewPasswordValidation } from '../validations/newPasswordValidation';
import { AuthController } from '../controller/AuthController';

const authController = container.get(AuthController);

const authRouter = Router();

authRouter.get(Routes.Me, bearerAuthMiddlewate, authController.me.bind(authController));

authRouter.post(
  Routes.Login,
  rateLimitMiddleware,
  loginOrEmailValidation,
  passwordValidationSchema,
  validationResultMiddleware,
  authController.login.bind(authController),
);

authRouter.post(
  Routes.Registration,
  rateLimitMiddleware,
  inputUserValidationSchema,
  validationResultMiddleware,
  authController.registration.bind(authController),
);

authRouter.post(
  Routes.EmailResending,
  rateLimitMiddleware,
  emailValidationSchema,
  validationResultMiddleware,
  authController.emailResending.bind(authController),
);

authRouter.post(
  Routes.RegistrationConfirmation,
  rateLimitMiddleware,
  emailConfirmationCodeValidation,
  validationResultMiddleware,
  authController.registrationConfirmation.bind(authController),
);

authRouter.post(
  Routes.RefreshToken,
  refreshTokenMiddleware,
  authController.refreshTokens.bind(authController),
);

authRouter.post(
  Routes.PasswordRecovery,
  rateLimitMiddleware,
  emailValidationSchema,
  validationResultMiddleware,
  authController.recoveryPassword.bind(authController),
);

authRouter.post(
  Routes.NewPassword,
  rateLimitMiddleware,
  inputNewPasswordValidation,
  validationResultMiddleware,
  authController.newPassword.bind(authController),
);

authRouter.post(Routes.Logout, refreshTokenMiddleware, authController.logout.bind(authController));

export { authRouter };

import { body, CustomValidator } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import { MAX_USER_LOGIN_LENGTH, MAX_USER_PASSWORD_LENGTH, MIN_USER_LOGIN_LENGTH, MIN_USER_PASSWORD_LENGTH } from '../constants';
import { LoginStringRegExp } from '../../../core/constants';

const customLoginValidator: CustomValidator = (input) => LoginStringRegExp.test(input);

const createPasswordValidation = (passwordFieldName: string) => body(passwordFieldName)
  .customSanitizer(customTrim)
  .isString()
    .withMessage('Password must have string type')
  .isLength({ min: MIN_USER_PASSWORD_LENGTH, max: MAX_USER_PASSWORD_LENGTH })
    .withMessage(`Password must have length in range ${MIN_USER_PASSWORD_LENGTH} - ${MAX_USER_PASSWORD_LENGTH}`);

const loginValidationSchema = body('login')
  .customSanitizer(customTrim)
  .isString()
    .withMessage('Login must have string type')
  .isLength({ min: MIN_USER_LOGIN_LENGTH, max: MAX_USER_LOGIN_LENGTH })
    .withMessage(`Login must have length in range ${MIN_USER_LOGIN_LENGTH} - ${MAX_USER_LOGIN_LENGTH}`)
  .custom(customLoginValidator)
    .withMessage('Invalid characters. Use A‑Z, a‑z, 0‑9, _, -');

const passwordValidationSchema = createPasswordValidation('password');

const emailValidationSchema = body('email')
  .customSanitizer(customTrim)
  .isString()
    .withMessage('Email must have string type')
  .isEmail()
    .withMessage('Email must have valid format. Example: example@example.dev')

const inputUserValidationSchema = [
  loginValidationSchema,
  passwordValidationSchema,
  emailValidationSchema
];

export {
  inputUserValidationSchema,
  customLoginValidator,
  createPasswordValidation,
  emailValidationSchema,
  passwordValidationSchema,
};

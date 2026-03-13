import { body } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import { createPasswordValidation } from '../../users/validations/inputUserValidationSchema';

const recoveryCodeValidation = body('recoveryCode')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('recoveryCode is required')
  .isString()
    .withMessage('recoveryCode must have string type')
  .notEmpty()
    .withMessage('recoveryCode should not be an empty string');

const newPasswordValidation = createPasswordValidation('newPassword');

const inputNewPasswordValidation = [recoveryCodeValidation, newPasswordValidation];

export { inputNewPasswordValidation };

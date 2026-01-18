import { checkSchema, param } from 'express-validator';
import { customTrim } from '../../core/validation/validationMiddleware';
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_TITLE_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
} from './constants';

const idInParamsCheckMiddleware = param('id')
.exists().withMessage('Id is required') 
.isMongoId().withMessage('Id has incorrect format');

const inputPostValidationSchema = checkSchema({
  title: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isLength: {
      options: { max: MAX_POST_TITLE_LENGTH },
    },
  },
  shortDescription: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isLength: {
      options: { max: MAX_POST_SHORT_DESCRIPTION_LENGTH },
    },
  },
  content: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isLength: {
      options: { max: MAX_POST_CONTENT_LENGTH },
    },
  },
  blogId: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isMongoId: true,
  },
});

export { inputPostValidationSchema, idInParamsCheckMiddleware };

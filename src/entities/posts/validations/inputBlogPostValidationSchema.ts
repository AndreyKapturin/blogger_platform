import { checkSchema } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_TITLE_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
} from '../constants';

const inputBlogPostValidationSchema = checkSchema({
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
});

export { inputBlogPostValidationSchema };

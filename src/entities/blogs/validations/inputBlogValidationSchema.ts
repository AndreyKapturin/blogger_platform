import { checkSchema } from 'express-validator';
import { customTrim } from '../../../core/validation/validationMiddleware';
import {
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../constants';

const inputBlogValidationSchema = checkSchema({
  name: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isLength: {
      options: { max: MAX_BLOG_NAME_LENGTH },
    },
  },
  description: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isLength: {
      options: { max: MAX_BLOG_DESCRIPTION_LENGTH },
    },
  },
  websiteUrl: {
    customSanitizer: {
      options: customTrim,
    },
    exists: true,
    notEmpty: true,
    isString: true,
    isURL: {
      options: {
        ignore_max_length: true,
        max_allowed_length: 100,
        protocols: ['https'],
        allow_underscores: true,
        require_protocol: true,
      },
    },
    isLength: {
      options: { max: MAX_BLOG_WEBSITE_URL_LENGTH },
    },
  },
});

export { inputBlogValidationSchema };

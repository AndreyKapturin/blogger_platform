import { body } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import {
  MAX_BLOG_DESCRIPTION_LENGTH,
  MAX_BLOG_NAME_LENGTH,
  MAX_BLOG_WEBSITE_URL_LENGTH,
} from '../constants';

const nameValidation = body('name')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"name" is required in body')
  .notEmpty()
    .withMessage('"name" should not empty string')
  .isString()
    .withMessage('"name" must be string')
  .isLength({ max: MAX_BLOG_NAME_LENGTH })
    .withMessage(`"name" must have length less than ${MAX_BLOG_NAME_LENGTH}`);

const descriptionValidation = body('description')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"description" is required in body')
  .notEmpty()
    .withMessage('"description" should not empty string')
  .isString()
    .withMessage('"description" must be string')
  .isLength({ max: MAX_BLOG_DESCRIPTION_LENGTH })
    .withMessage(`"description" must have length less than ${MAX_BLOG_DESCRIPTION_LENGTH}`);

const websiteUrlValidation = body('websiteUrl')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"websiteUrl" is required in body')
  .notEmpty()
    .withMessage('"websiteUrl" should not empty string')
  .isString()
    .withMessage('"websiteUrl" must be string')
    .isURL({
      ignore_max_length: true, 
      max_allowed_length: MAX_BLOG_WEBSITE_URL_LENGTH,
      protocols: ['https'],
      allow_underscores: true,
      require_protocol: true,
    })
    .withMessage('"websiteUrl" ')

const inputBlogValidationSchema = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];

export { inputBlogValidationSchema };

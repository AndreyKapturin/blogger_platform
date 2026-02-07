import { body } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import {
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_TITLE_LENGTH,
  MAX_POST_SHORT_DESCRIPTION_LENGTH,
} from '../constants';

const titleValidation = body('title')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"title" is required in body')
  .notEmpty()
    .withMessage('"title" should not empty string')
  .isString()
    .withMessage('"title" must be string')
  .isLength({ max: MAX_POST_TITLE_LENGTH })
    .withMessage(`"title" must have length less than ${MAX_POST_TITLE_LENGTH}`);


const shortDescriptionValidation = body('shortDescription')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"shortDescription" is required in body')
  .notEmpty()
    .withMessage('"shortDescription" should not empty string')
  .isString()
    .withMessage('"shortDescription" must be string')
  .isLength({ max: MAX_POST_SHORT_DESCRIPTION_LENGTH })
    .withMessage(`"shortDescription" must have length less than ${MAX_POST_SHORT_DESCRIPTION_LENGTH}`);



const contentValidation = body('content')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"content" is required in body')
  .notEmpty()
    .withMessage('"content" should not empty string')
  .isString()
    .withMessage('"content" must be string')
  .isLength({ max: MAX_POST_CONTENT_LENGTH })
    .withMessage(`"content" must have length less than ${MAX_POST_CONTENT_LENGTH}`);


const inputBlogPostValidationSchema = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
]

export { inputBlogPostValidationSchema };

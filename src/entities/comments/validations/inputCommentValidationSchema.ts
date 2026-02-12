import { body } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import { MAX_COMMENT_CONTENT_LENGTH, MIN_COMMENT_CONTENT_LENGTH } from '../constants';

const inputCommentValidationSchema = body('content')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"content" is required in body')
  .notEmpty()
    .withMessage('"content" should not empty string')
  .isString()
    .withMessage('"content" must be string')
  .isLength({ min: MIN_COMMENT_CONTENT_LENGTH, max: MAX_COMMENT_CONTENT_LENGTH })
    .withMessage(
      `length of the "content" should be in the range from ${MIN_COMMENT_CONTENT_LENGTH} to ${MAX_COMMENT_CONTENT_LENGTH} characters`,
  );

export { inputCommentValidationSchema };

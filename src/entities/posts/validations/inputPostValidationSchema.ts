import { body } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import { inputBlogPostValidationSchema } from './inputBlogPostValidationSchema';

const blogIdValidation = body('blogId')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"blogId" is required in body')
  .notEmpty()
    .withMessage('"blogId" should not empty string')
  .isString()
    .withMessage('"blogId" must be string')
  .isMongoId()
    .withMessage('"blogId" must be mongo ObjectId format')

const inputPostValidationSchema = [
  ...inputBlogPostValidationSchema,
  blogIdValidation,
]

export { inputPostValidationSchema };

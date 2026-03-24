import { body } from 'express-validator';
import { customTrim } from '../../../core/middlewares/validationMiddleware';
import { LikeStatus } from '../types';

const availableLikeStatuses = Object.values(LikeStatus);

const inputLikeStatusValidation = body('likeStatus')
  .customSanitizer(customTrim)
  .exists()
    .withMessage('"likeStatus" is required in body')
  .notEmpty()
    .withMessage('"likeStatus" should not empty string')
  .isString()
    .withMessage('"likeStatus" must be string')
  .isIn(availableLikeStatuses)
    .withMessage('"likeStatus" field can take the values: ' + availableLikeStatuses);

export { inputLikeStatusValidation };

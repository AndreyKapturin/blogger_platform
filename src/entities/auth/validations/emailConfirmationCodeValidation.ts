import { body } from "express-validator";
import { customTrim } from "../../../core/middlewares/validationMiddleware";

const emailConfirmationCodeValidation = [
  body('code')
    .customSanitizer(customTrim)
    .exists()
      .withMessage('"code" is required in body')
    .isString()
      .withMessage('"code" must have string type')
    .notEmpty()
      .withMessage('"code" should not empty string')
    .isUUID()
      .withMessage('"code" should have UUID format')
]

export { emailConfirmationCodeValidation }
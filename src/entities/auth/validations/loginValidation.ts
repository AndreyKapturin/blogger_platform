import { body } from "express-validator";
import { customTrim } from "../../../core/middlewares/validationMiddleware";
import { customLoginValidator } from "../../users/validations/inputUserValidationSchema";

const loginOrEmailValidation = [
  body('loginOrEmail')
    .customSanitizer(customTrim),
  body('loginOrEmail')
    .isString()
    .withMessage('Login or email must have string type'),
  body('loginOrEmail')
    .if((input) => input.includes('@'))
    .isEmail()
    .withMessage('Email must have valid format. Example: example@example.dev'),
  body('loginOrEmail')
    .if((input) => !input.includes('@'))
    .custom(customLoginValidator)
    .withMessage('Invalid characters. Use A‑Z, a‑z, 0‑9, _, -')
]

export { loginOrEmailValidation }
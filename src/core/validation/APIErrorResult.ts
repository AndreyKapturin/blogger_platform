import { ValidationFieldError } from "./validationError"

export type APIErrorResult = {
  errorsMessages: ValidationFieldError[]
}
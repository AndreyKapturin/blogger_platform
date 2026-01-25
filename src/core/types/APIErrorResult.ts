import { ValidationFieldError } from "./ValidationError"

export type APIErrorResult = {
  errorsMessages: ValidationFieldError[]
}
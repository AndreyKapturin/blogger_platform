import { HttpStatus } from "../types/HttpStatus";
import { ResultStatus } from "../types/Result";

const resultStatusToHttpStatus = (resultStatus: ResultStatus): HttpStatus => {
  switch (resultStatus) {
    case ResultStatus.InvalidCredentials: return HttpStatus.Unauthorized;
    case ResultStatus.NotFound: return HttpStatus.Not_Found;
    case ResultStatus.PermissionError: return HttpStatus.Forbidden;
    default: return HttpStatus.Internal_Server_Error;
  }
}

export { resultStatusToHttpStatus }
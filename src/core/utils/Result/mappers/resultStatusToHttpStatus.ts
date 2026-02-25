import { HttpStatus } from "../../../types/HttpStatus";
import { ResultStatus } from "../types";

const resultStatusToHttpStatus = (resultStatus: ResultStatus): HttpStatus => {
  switch (resultStatus) {
    case ResultStatus.InvalidCredentials: return HttpStatus.Unauthorized;
    case ResultStatus.InvalidData: return HttpStatus.Bad_Request;
    case ResultStatus.NotFound: return HttpStatus.Not_Found;
    case ResultStatus.PermissionError: return HttpStatus.Forbidden;
    default: return HttpStatus.Internal_Server_Error;
  }
}

export { resultStatusToHttpStatus }
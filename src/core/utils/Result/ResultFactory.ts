import { ResultExtension, ResultStatus, SuccessResult, WrongResult } from "./types";

class ResultFactory {
  public static success<T>(data: T, extensions: ResultExtension[] = []): SuccessResult<T> {
    return {
      status: ResultStatus.Success,
      data,
      extensions,
    };
  }

  public static wrong(
    status: Exclude<ResultStatus, ResultStatus.Success>,
    errorMessage: string,
    extensions: ResultExtension[] = []
  ): WrongResult {
    return {
      status,
      errorMessage,
      extensions,
    };
  }
}

export { ResultFactory }
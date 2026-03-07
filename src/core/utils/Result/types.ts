enum ResultStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  InvalidCredentials = 'InvalidCredentials',
  PermissionError = 'PermissionError',
  InvalidData = 'InvalidData',
}

type ResultExtension = {
  field: string | null;
  message: string;
};

type SuccessResult<T = null> = {
  status: ResultStatus.Success;
  data: T;
  extensions: ResultExtension[];
};

type WrongResult = {
  status: Exclude<ResultStatus, ResultStatus.Success>;
  errorMessage: string;
  extensions: ResultExtension[];
};

type Result<T = null> = SuccessResult<T> | WrongResult;

export { ResultStatus };
export type { ResultExtension, Result, SuccessResult, WrongResult };

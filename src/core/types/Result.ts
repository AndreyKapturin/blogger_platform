enum ResultStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  InvalidCredentials = 'InvalidCredentials',
  PermissionError = 'PermissionError',
}

type ExtensionResultMessage = {
  field: string | null;
  message: string;
};

type Result<T = null> = 
  | 
    {
      status: ResultStatus.Success;
      data: T;
      errorMessage?: string;
      extensions: ExtensionResultMessage[];
    }
  |
    {
      status: ResultStatus.InvalidCredentials;
      errorMessage?: string;
      extensions: ExtensionResultMessage[];
    }
  |
    {
      status: ResultStatus.NotFound;
      errorMessage?: string;
      extensions: ExtensionResultMessage[];
    }
  |
    {
      status: ResultStatus.PermissionError;
      errorMessage?: string;
      extensions: ExtensionResultMessage[];
    };
  
export { ResultStatus };
export type { ExtensionResultMessage, Result };

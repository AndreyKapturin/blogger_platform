import { APIErrorResult } from '../../../types/APIErrorResult';
import { ResultExtension } from '../types';

const extensionResultToAPIError = (extensionResult: ResultExtension[]): APIErrorResult => {
  return { errorsMessages: extensionResult };
};

export { extensionResultToAPIError };

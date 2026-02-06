import { APIErrorResult } from '../types/APIErrorResult';
import { ExtensionResultMessage } from '../types/Result';

const extensionResultToAPIError = (extensionResult: ExtensionResultMessage[]): APIErrorResult => {
  return { errorsMessages: extensionResult };
};

export { extensionResultToAPIError };

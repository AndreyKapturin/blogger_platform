import { Response } from "express";
import { Result, ResultStatus, WrongResult } from "./types";
import { resultStatusToHttpStatus } from "./mappers/resultStatusToHttpStatus";
import { extensionResultToAPIError } from "./mappers/extensionResultToAPIError";

const isWrongResult = (result: Result<unknown>): result is WrongResult => {
  return result.status !== ResultStatus.Success
};

const sendHttpResponseIfWrongResult = (result: Result<unknown>, response: Response) => {
  response
    .status(resultStatusToHttpStatus(result.status))
    .json(extensionResultToAPIError(result.extensions));
}

export { sendHttpResponseIfWrongResult, isWrongResult }
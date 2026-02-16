import { Response } from "express";
import { RequestWithBody } from "../../../../core/types/RequestTypes";
import { EmailConfirmationCode } from "../../types";
import { APIErrorResult } from "../../../../core/types/APIErrorResult";
import { ResultStatus } from "../../../../core/types/Result";
import { authService } from "../../application/authService";
import { resultStatusToHttpStatus } from "../../../../core/mappers/resultStatusToHttpStatus";
import { extensionResultToAPIError } from "../../../../core/mappers/extensionResultToAPIError";
import { HttpStatus } from "../../../../core/types/HttpStatus";

const registrationConfirmationHandler = async (
  req: RequestWithBody<EmailConfirmationCode>,
  res: Response<APIErrorResult>
) => {
  const registrationConfirmationResult = await authService.confirmRegistration(req.body.code);

  if (registrationConfirmationResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(registrationConfirmationResult.status))
      .json(extensionResultToAPIError(registrationConfirmationResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { registrationConfirmationHandler };

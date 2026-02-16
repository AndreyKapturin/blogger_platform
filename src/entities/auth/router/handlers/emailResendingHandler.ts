import { Response } from "express";
import { RequestWithBody } from "../../../../core/types/RequestTypes";
import { InputEmailResendingType } from "../../types";
import { APIErrorResult } from "../../../../core/types/APIErrorResult";
import { authService } from "../../application/authService";
import { ResultStatus } from "../../../../core/types/Result";
import { resultStatusToHttpStatus } from "../../../../core/mappers/resultStatusToHttpStatus";
import { extensionResultToAPIError } from "../../../../core/mappers/extensionResultToAPIError";
import { HttpStatus } from "../../../../core/types/HttpStatus";

const emailResendingHandler = async (
  req: RequestWithBody<InputEmailResendingType>,
  res: Response<APIErrorResult>
) => {
  const resendingConfirmationCodeResult = await authService.resendingConfirmationCode(req.body.email);
  
  if (resendingConfirmationCodeResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(resendingConfirmationCodeResult.status))
      .json(extensionResultToAPIError(resendingConfirmationCodeResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { emailResendingHandler };

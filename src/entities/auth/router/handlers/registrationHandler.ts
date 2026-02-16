import { Response } from "express";
import { RequestWithBody } from "../../../../core/types/RequestTypes";
import { InputRegistrationType } from "../../types";
import { HttpStatus } from "../../../../core/types/HttpStatus";
import { authService } from "../../application/authService";
import { ResultStatus } from "../../../../core/types/Result";
import { resultStatusToHttpStatus } from "../../../../core/mappers/resultStatusToHttpStatus";
import { extensionResultToAPIError } from "../../../../core/mappers/extensionResultToAPIError";

const registrationHandler = async (
  req: RequestWithBody<InputRegistrationType>,
  res: Response
) => {
  const registrationResult = await authService.registration(req.body);

  if (registrationResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(registrationResult.status))
      .json(extensionResultToAPIError(registrationResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { registrationHandler };

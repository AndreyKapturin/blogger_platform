import { Response } from "express";
import { RequestWithBody } from "../../../../core/types/RequestTypes";
import { InputLoginType } from "../../types";
import { authService } from "../../application/service";
import { HttpStatus } from "../../../../core/types/HttpStatus";
import { ResultStatus } from "../../../../core/types/Result";
import { resultStatusToHttpStatus } from "../../../../core/mappers/resultStatusToHttpStatus";
import { extensionResultToAPIError } from "../../../../core/mappers/extensionResultToAPIError";

const loginHandler = async (
  req: RequestWithBody<InputLoginType>,
  res: Response
) => {
  const loginResult = await authService.login(req.body);

  if (loginResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(loginResult.status))
      .json(extensionResultToAPIError(loginResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { loginHandler };

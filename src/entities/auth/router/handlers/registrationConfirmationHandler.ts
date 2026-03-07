import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { EmailConfirmationCode } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { authService } from '../../application/authService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';

const registrationConfirmationHandler = async (
  req: RequestWithBody<EmailConfirmationCode>,
  res: Response<APIErrorResult>,
) => {
  const registrationConfirmationResult = await authService.confirmRegistration(req.body.code);

  if (isWrongResult(registrationConfirmationResult)) {
    sendHttpResponseIfWrongResult(registrationConfirmationResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { registrationConfirmationHandler };

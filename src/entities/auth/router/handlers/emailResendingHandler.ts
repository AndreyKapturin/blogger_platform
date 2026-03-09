import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputEmailResendingType } from '../../types';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { authService } from '../../../../compositionRoot';

const emailResendingHandler = async (
  req: RequestWithBody<InputEmailResendingType>,
  res: Response<APIErrorResult>,
) => {
  const resendingConfirmationCodeResult = await authService
    .resendingConfirmationCode(req.body.email);

  if (isWrongResult(resendingConfirmationCodeResult)) {
    sendHttpResponseIfWrongResult(resendingConfirmationCodeResult, res);
    return
  }
  
  res.sendStatus(HttpStatus.No_Content);
};

export { emailResendingHandler };

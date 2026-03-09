import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputRegistrationType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { authService } from '../../../../compositionRoot';

const registrationHandler = async (req: RequestWithBody<InputRegistrationType>, res: Response) => {
  const registrationResult = await authService.registration(req.body);

  if (isWrongResult(registrationResult)) {
    sendHttpResponseIfWrongResult(registrationResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { registrationHandler };

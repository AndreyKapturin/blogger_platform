import { Request, Response } from 'express';
import { devicesService } from '../../application/devicesService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const terminateOtherDevices = async (req: Request, res: Response) => {
  const result = await devicesService.terminateOtherDevices(req.cookies.refreshToken);

  if (isWrongResult(result)) {
    sendHttpResponseIfWrongResult(result, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { terminateOtherDevices };

import { Response } from 'express';
import { devicesService } from '../../application/devicesService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { RequestWithParams } from '../../../../core/types/RequestTypes';

const terminateDevice = async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const deviceId = req.params.id;
  const refreshToken = req.cookies.refreshToken;

  const terminateDeviceResult = await devicesService.terminateDeviceById(deviceId, refreshToken);

  if (isWrongResult(terminateDeviceResult)) {
    sendHttpResponseIfWrongResult(terminateDeviceResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { terminateDevice };

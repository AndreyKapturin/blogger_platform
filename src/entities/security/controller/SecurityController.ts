import { Request, Response } from 'express';
import { SecurityDevice } from '../../auth/types';
import { SessionsQueryRepository } from '../../auth/repositories/sessionsQueryRepository';
import { JwtService } from '../../../core/utils/jwt/jwtUtils';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { RequestWithParams } from '../../../core/types/RequestTypes';
import { DevicesService } from '../application/devicesService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../core/utils/Result/sendHttpResponseIfWrongResult';

class SecurityController {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
    private devicesService: DevicesService,
    private jwtService: JwtService,
  ) {}

  async getSecurityDevices(req: Request, res: Response<SecurityDevice[]>) {
    const { userId } = this.jwtService.decodeToken(req.cookies.refreshToken);
    const devices = await this.sessionsQueryRepository.getAllDevicesForUser(userId);
    res.status(HttpStatus.Ok).json(devices);
  }

  async terminateDevice(req: RequestWithParams<{ id: string }>, res: Response) {
    const deviceId = req.params.id;
    const refreshToken = req.cookies.refreshToken;

    const terminateDeviceResult = await this.devicesService.terminateDeviceById(
      deviceId,
      refreshToken,
    );

    if (isWrongResult(terminateDeviceResult)) {
      sendHttpResponseIfWrongResult(terminateDeviceResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async terminateOtherDevices(req: Request, res: Response) {
    const result = await this.devicesService.terminateOtherDevices(req.cookies.refreshToken);

    if (isWrongResult(result)) {
      sendHttpResponseIfWrongResult(result, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }
}

export { SecurityController };

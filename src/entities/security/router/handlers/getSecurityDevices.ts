import { Request, Response } from 'express';
import { SecurityDevice } from '../../../auth/types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { jwtService, sessionsQueryRepository } from '../../../../compositionRoot';

const getSecurityDevices = async (req: Request, res: Response<SecurityDevice[]>) => {
  const { userId } = jwtService.decodeToken(req.cookies.refreshToken);
  const devices = await sessionsQueryRepository.getAllDevicesForUser(userId);
  res.status(HttpStatus.Ok).json(devices);
};

export { getSecurityDevices };

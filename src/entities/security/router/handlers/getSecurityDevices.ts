import { Request, Response } from 'express';
import { SecurityDevice } from '../../../auth/types';
import { jwtService } from '../../../../core/utils/jwt/jwtUtils';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sessionsQueryRepository } from '../../../auth/repositories/sessionsQueryRepository';

const getSecurityDevices = async (req: Request, res: Response<SecurityDevice[]>) => {
  const { userId } = jwtService.decodeToken(req.cookies.refreshToken);
  const devices = await sessionsQueryRepository.getAllDevicesForUser(userId);
  res.status(HttpStatus.Ok).json(devices);
};

export { getSecurityDevices };

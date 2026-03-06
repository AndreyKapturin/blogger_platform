import { Request, Response } from 'express';
import { SecurityDevice } from '../../../auth/types';
import { decodeToken } from '../../../../core/utils/jwt/jwtUtils';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sessionQueryRepository } from '../../../auth/repositories/sessionQueryRepository';

const getSecurityDevices = async (req: Request, res: Response<SecurityDevice[]>) => {
  const { userId } = decodeToken(req.cookies.refreshToken);
  const devices = await sessionQueryRepository.getAllDevicesForUser(userId);
  res.status(HttpStatus.Ok).json(devices);
};

export { getSecurityDevices };

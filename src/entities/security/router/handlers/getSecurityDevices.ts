import { Request, Response } from 'express';
import { SecurityDevice } from '../../../auth/types';
import { decodeToken } from '../../../../core/utils/jwt/jwtUtils';
import { devicesQueryRepository } from '../../repositories/devicesQueryRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const getSecurityDevices = async (
  req: Request,
  res: Response<SecurityDevice[]>,
) => {
  const refreshToken = req.cookies.refreshToken;
  const tokenPayload = decodeToken(refreshToken);
  const userId = tokenPayload.userId;
  const devices = await devicesQueryRepository.getAllDevicesForUser(userId);
  res.status(HttpStatus.Ok).json(devices);
};

export { getSecurityDevices };

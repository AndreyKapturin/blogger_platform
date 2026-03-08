import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { jwtService } from '../utils/jwt/jwtUtils';
import { log } from '../utils/logger/loggerUtils';
import { JwtTokenDecodePayload } from '../../entities/auth/types';
import { sessionsCommandRepository } from '../../entities/auth/repositories/sessionsCommandRepository';

const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    res
      .status(HttpStatus.Unauthorized)
      .json({
        errorsMessages: [
          {
            field: 'refreshToken',
            message: 'Refresh token not passed',
          }
        ]
      })
    return;
  }

  let tokenPayload: JwtTokenDecodePayload;

  try {
    tokenPayload = await jwtService.verifyToken(refreshToken);
  } 
  catch (error) {
    log(error);
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    res
      .status(HttpStatus.Unauthorized)
      .json({
        errorsMessages: [
          {
            field: 'refreshToken',
            message: 'Refresh token is invalid',
          }
        ]
      })
    return;
  }

  const isActiveSession = await sessionsCommandRepository
    .existsDeviceSession(tokenPayload.deviceId, new Date(tokenPayload.iat * 1000))

  if (!isActiveSession) {
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    res
      .status(HttpStatus.Unauthorized)
      .json({
        errorsMessages: [
          {
            field: 'refreshToken',
            message: 'Passed refresh token already revoked',
          }
        ]
      })
    return;
  }

  next();
};

export { refreshTokenMiddleware };

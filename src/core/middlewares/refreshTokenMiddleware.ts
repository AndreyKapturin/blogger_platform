import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { verifyToken } from '../utils/jwt/jwtUtils';
import { log } from '../utils/logger/loggerUtils';
import { refreshTokenCommandRepository } from '../../entities/auth/repositories/refreshTokenCommandRepository';

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


  try {
    await verifyToken(refreshToken);
  } 
  catch (error) {
    log(error);
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

  const isRevokedToken = await refreshTokenCommandRepository
    .checkTokenInRevokedList(refreshToken);

  if (isRevokedToken) {
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

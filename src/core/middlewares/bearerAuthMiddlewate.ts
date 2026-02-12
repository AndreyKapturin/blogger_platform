import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { verifyAccessToken } from '../utils/jwt/jwtUtils';
import { log } from '../utils/logger/loggerUtils';

const bearerAuthMiddlewate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }
  const [ authType, token ] = authHeader.split(' ');

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  if (!token || token.length === 0) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  try {
    const payload = await verifyAccessToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    log(error);
    res.sendStatus(HttpStatus.Unauthorized);
  }
};

export { bearerAuthMiddlewate }
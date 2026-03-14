import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { log } from '../utils/logger/loggerUtils';
import { container } from '../../compositionRoot';
import { JwtService } from '../utils/jwt/jwtUtils';

const jwtService = container.get(JwtService);

const bearerAuthMiddlewate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }
  const [authType, token] = authHeader.split(' ');

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  if (!token || token.length === 0) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  try {
    const payload = await jwtService.verifyToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    log(error);
    res.sendStatus(HttpStatus.Unauthorized);
  }
};

export { bearerAuthMiddlewate };

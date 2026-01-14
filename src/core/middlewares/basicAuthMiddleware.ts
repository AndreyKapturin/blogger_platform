import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../types/HttpStatus";
import { ADMIN_LOGIN, ADMIN_PASSWORD } from "../constants";

const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }
  const [ authType, credentials ] = authHeader.split(' ');

  if (authType !== 'Basic') {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  if (!credentials || credentials.length === 0) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');

  const [ login, password ] = decodedCredentials.split(':');

   if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  next()
}

export { basicAuthMiddleware }
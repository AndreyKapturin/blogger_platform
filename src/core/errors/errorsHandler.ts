import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { log } from '../utils/logger/loggerUtils';

const errorsHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  log(error)
  res.sendStatus(HttpStatus.Internal_Server_Error);
};

export { errorsHandler };

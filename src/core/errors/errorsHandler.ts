import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';

const errorsHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  res.sendStatus(HttpStatus.Internal_Server_Error);
};

export { errorsHandler };

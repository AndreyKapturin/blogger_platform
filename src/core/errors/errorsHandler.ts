import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { ResourceNotFoundError } from './ResourceNotFoundError';

const errorsHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ResourceNotFoundError) {
    res.status(HttpStatus.Not_Found).json({
      errorsMessages: [
        {
          message: error.message,
        },
      ],
    });
  } else {
    res.sendStatus(HttpStatus.Internal_Server_Error);
  }
};

export { errorsHandler };

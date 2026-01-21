import { NextFunction, Request, Response } from 'express';
import { BusinessLogicError } from '../core/errors/BusinessLogicError';
import { HttpStatus } from '../core/types/HttpStatus';

const errorsHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof BusinessLogicError) {
    res.status(HttpStatus.Unprocessable_Entity).json({
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

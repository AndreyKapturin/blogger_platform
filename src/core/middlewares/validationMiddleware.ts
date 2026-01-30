import { NextFunction, Request, Response } from 'express';
import { CustomSanitizer, ErrorFormatter, validationResult } from 'express-validator';
import { HttpStatus } from '../types/HttpStatus';

const _errorFormatter: ErrorFormatter = (error) => {
  return error.type === 'field'
    ? {
        field: error.path,
        message: error.msg,
      }
    : error;
};

const validationResultMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
  } else {
    const arrayResult = result.formatWith(_errorFormatter).array({ onlyFirstError: true });
    console.log(arrayResult);
    
    res.status(HttpStatus.Bad_Request).json({ errorsMessages: arrayResult });
    return;
  }
};

const customTrim: CustomSanitizer = (input) => {
  if (input === undefined) return;
  if (typeof input === 'string') return input.trim();
};

export { validationResultMiddleware, customTrim };

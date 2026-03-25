import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/HttpStatus';
import { REQUEST_COUNT_LIMIT } from '../../entities/requests/constants';
import { container } from '../../compositionRoot';
import { RequestsCommandRepository } from '../../entities/requests/repositories/requestsCommandRepository';
import { RequestModel } from '../../entities/requests/domain/RequestModel';

const requestsCommandRepository = container.get(RequestsCommandRepository);

const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip!;
  const url = req.originalUrl;
  const date = new Date();

  const requestsCount = await requestsCommandRepository.getRequestsCount(ip, url);

  if (requestsCount >= REQUEST_COUNT_LIMIT) {
    res.sendStatus(HttpStatus.To_Many_Requests);
    return;
  }

  const request = new RequestModel({
    date,
    ip,
    url,
  });

  await requestsCommandRepository.save(request);

  next();
};

export { rateLimitMiddleware };

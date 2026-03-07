import { NextFunction, Request, Response } from "express";
import { RequestType } from "../../entities/requests/types";
import { requestsCommandRepository } from "../../entities/requests/repositories/requestsCommandRepository";
import { HttpStatus } from "../types/HttpStatus";
import { REQUEST_COUNT_LIMIT } from "../../entities/requests/constants";

const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip!;
  const url = req.originalUrl;
  const date = new Date();

  const requestsCount = await requestsCommandRepository.getRequestsCount(ip, url);
  
  if (requestsCount >= REQUEST_COUNT_LIMIT) {
    res.sendStatus(HttpStatus.To_Many_Requests);
    return 
  }

  const request: RequestType = { ip, date, url };
  await requestsCommandRepository.save(request);
  
  next();
}

export { rateLimitMiddleware };
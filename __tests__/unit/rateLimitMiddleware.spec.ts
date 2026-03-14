import { Request, Response } from 'express';
import { rateLimitMiddleware } from '../../src/core/middlewares/rateLimitMiddleware';
import { HttpStatus } from '../../src/core/types/HttpStatus';
import { RequestType } from '../../src/entities/requests/types';
import { ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';
import { Routes } from '../../src/app/routes';
import {
  RATE_LIMIT_WINDOW_IN_SECONDS,
  REQUEST_COUNT_LIMIT,
} from '../../src/entities/requests/constants';
import { container } from '../../src/compositionRoot';
import { RequestsCommandRepository } from '../../src/entities/requests/repositories/requestsCommandRepository';

const requestsCommandRepository = container.get(RequestsCommandRepository);

const requests: RequestType[] = [];

const save = async (request: RequestType) => {
  requests.push(request);
  return new ObjectId();
};

const getRequestsCount = async (ip: string, url: string) => {
  const targetDate = new Date();
  targetDate.setSeconds(targetDate.getSeconds() - RATE_LIMIT_WINDOW_IN_SECONDS);
  return requests.reduce((count, request) => {
    if (
      request.ip === ip &&
      request.url === url &&
      request.date.getTime() >= targetDate.getTime()
    ) {
      count += 1;
    }
    return count;
  }, 0);
};

beforeAll(() => {
  jest.spyOn(requestsCommandRepository, 'save').mockImplementation(save);
  jest.spyOn(requestsCommandRepository, 'getRequestsCount').mockImplementation(getRequestsCount);
});

afterAll(() => {
  jest.resetAllMocks();
});

beforeEach(() => {
  requests.length = 0;
});

describe('Rate limit middleware', () => {
  it('should not call sendStatus if the request limit is not exceeded', async () => {
    const mockRequest: Partial<Request> = jest.mocked({
      ip: faker.internet.ipv4(),
      originalUrl: Routes.AuthLogin,
    });

    const mockResponse: Partial<Response> = jest.mocked({
      sendStatus: jest.fn(),
    });

    const next = jest.fn();

    for (let i = 0; i < REQUEST_COUNT_LIMIT; i++) {
      await rateLimitMiddleware(mockRequest as Request, mockResponse as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(REQUEST_COUNT_LIMIT);
    expect(mockResponse.sendStatus).not.toHaveBeenCalled();
  });

  it(`should call sendStatus and pass ${HttpStatus.To_Many_Requests} status code if was send more than 5 requests per 10 seconds`, async () => {
    const mockRequest: Partial<Request> = jest.mocked({
      ip: faker.internet.ipv4(),
      originalUrl: Routes.AuthLogin,
    });

    const mockResponse: Partial<Response> = jest.mocked({
      sendStatus: jest.fn(),
    });

    const next = jest.fn();

    for (let i = 0; i < REQUEST_COUNT_LIMIT + 1; i++) {
      await rateLimitMiddleware(mockRequest as Request, mockResponse as Response, next);
    }

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(HttpStatus.To_Many_Requests);
    expect(next).toHaveBeenCalledTimes(REQUEST_COUNT_LIMIT);
  });
});

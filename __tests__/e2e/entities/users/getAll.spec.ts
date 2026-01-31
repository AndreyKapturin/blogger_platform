import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { Paginator } from '../../../../src/core/types/PaginationAndSorting';
import { ViewUserType } from '../../../../src/entities/users/types';
import { EmailStringRegExp, ISODateStringRegExp } from '../../utils/constants';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader, LoginStringRegExp } from '../../../../src/core/constants';

let app: Express;

beforeAll(async () => {
  app = await createApp();
});

const expectUser = expect.objectContaining<ViewUserType>({
  id: expect.any(String),
  login: expect.stringMatching(LoginStringRegExp),
  email: expect.stringMatching(EmailStringRegExp),
  createdAt: expect.stringMatching(ISODateStringRegExp),
});

const expectedPaginatedUsersBody = expect.objectContaining<Paginator<ViewUserType>>({
  page: expect.any(Number),
  pageSize: expect.any(Number),
  pagesCount: expect.any(Number),
  totalCount: expect.any(Number),
  items: expect.arrayOf(expectUser),
});

describe(`GET ${Routes.Users}`, () => {
  it('should return paginated users', async () => {
    const response = await request(app)
      .get(Routes.Users)
      .set('Authorization', authHeader);
    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toEqual(expectedPaginatedUsersBody);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

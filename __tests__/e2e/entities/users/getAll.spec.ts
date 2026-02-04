import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { UsersSortFields, ViewUsersQuery, ViewUserType } from '../../../../src/entities/users/types';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { authHeader } from '../../../../src/core/constants';
import { DEFAULT_USERS_PAGE_SIZE } from '../../../../src/entities/users/constants';
import { createUsersTestManager, UsersTestManagerType } from '../../utils/usersTestManager';

let app: Express;
let users: ViewUserType[] = [];
let usersTestManager: UsersTestManagerType;

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
  usersTestManager = createUsersTestManager(app);
  users = await usersTestManager.createManyUsers(100);
});

describe(`GET ${Routes.Users}`, () => {
  it('should return paginated users', async () => {
    const response = await request(app)
      .get(Routes.Users)
      .set('Authorization', authHeader);

    const pagesCount = Math.ceil(users.length / DEFAULT_USERS_PAGE_SIZE) || 1;

    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(DEFAULT_USERS_PAGE_SIZE);
    expect(response.body.pagesCount).toBe(pagesCount);
    expect(response.body.totalCount).toBe(users.length);
    expect(users).toEqual(expect.arrayContaining(response.body.items))
  });

  it('should return paginated users by search query', async () => {
    const query: Partial<ViewUsersQuery> = {
      searchLoginTerm: 'm',
      sortBy: UsersSortFields.Login
    }

    const searchLoginRegExp = new RegExp(query.searchLoginTerm!, 'i');
    const foundUsers = users.filter(u => searchLoginRegExp.test(u.login));

    const response = await request(app)
      .get(Routes.Users)
      .query(query)
      .set('Authorization', authHeader);

    const pagesCount = Math.ceil(foundUsers.length / DEFAULT_USERS_PAGE_SIZE) || 1;

    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(DEFAULT_USERS_PAGE_SIZE);
    expect(response.body.pagesCount).toBe(pagesCount);
    expect(response.body.totalCount).toBe(foundUsers.length);
    expect(foundUsers).toEqual(expect.arrayContaining(response.body.items));
  });
});

afterAll(async () => {
  await closeBbConnection();
});

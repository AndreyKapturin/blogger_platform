import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { createUsersTestManager, UsersTestManagerType } from '../../utils/usersTestManager';
import { extractFromCookieArray } from '../../../../src/core/utils/cookie/cookieUtils';
import { faker } from '@faker-js/faker';
import { JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS } from '../../../../src/core/config';

let app: Express;
let usersTestManager: UsersTestManagerType;

const sleep = async (timeInSeconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInSeconds * 1000));
};

beforeAll(async () => {
  app = await createApp();
  usersTestManager = createUsersTestManager(app);
});

beforeEach(async () => {
  await request(app).delete(`${Routes.Testing}/all-data`).expect(HttpStatus.No_Content);
});

describe(`POST ${Routes.Auth}/logout`, () => {
  it(`should return ${HttpStatus.No_Content} if passed valid refresh token`, async () => {
    const { input } = await usersTestManager.createUser();
    const loginResponse = await request(app).post(`${Routes.Auth}/login`).send({
      loginOrEmail: input.login,
      password: input.password,
    });

    let setCookieHeader = loginResponse.headers['set-cookie'];
    let cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    let refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    const logoutResponse = await request(app)
      .post(`${Routes.Auth}/logout`)
      .set('Cookie', `refreshToken=${refreshToken}`);

    setCookieHeader = logoutResponse.headers['set-cookie'];
    cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    expect(logoutResponse.status).toBe(HttpStatus.No_Content);
    expect(refreshToken).toBeNull();
  });

  it(`should return ${HttpStatus.Unauthorized} if refresh token not passed`, async () => {
    const logoutResponse = await request(app).post(`${Routes.Auth}/logout`);
    expect(logoutResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Unauthorized} if passed invalid refresh token`, async () => {
    const refreshToken = faker.internet.jwt();
    const logoutResponse = await request(app)
      .post(`${Routes.Auth}/logout`)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(logoutResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Unauthorized} if passed refresh token is expires`, async () => {
    const { input } = await usersTestManager.createUser();
    const loginResponse = await request(app).post(`${Routes.Auth}/login`).send({
      loginOrEmail: input.login,
      password: input.password,
    });

    const setCookieHeader = loginResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    await sleep(JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS + 1);

    const logoutResponse = await request(app)
      .post(`${Routes.Auth}/logout`)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(logoutResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Unauthorized} if passed revoked refresh token`, async () => {
    const { input } = await usersTestManager.createUser();
    const loginResponse = await request(app).post(`${Routes.Auth}/login`).send({
      loginOrEmail: input.login,
      password: input.password,
    });

    const setCookieHeader = loginResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    const refreshTokenResponse = await request(app)
      .post(`${Routes.Auth}/refresh-token`)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshTokenResponse.status).toBe(HttpStatus.Ok);

    const logoutResponse = await request(app)
      .post(`${Routes.Auth}/logout`)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(logoutResponse.status).toBe(HttpStatus.Unauthorized);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

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
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
});

describe(`POST ${Routes.AuthRefreshToken}`, () => {
  it(`should return ${HttpStatus.Ok} if passed valid refresh token`, async () => {
    const { input } = await usersTestManager.createUser();
    const loginResponse = await request(app).post(Routes.AuthLogin).send({
      loginOrEmail: input.login,
      password: input.password,
    });

    const setCookieHeader = loginResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    const refreshTokenResponse = await request(app)
      .post(Routes.AuthRefreshToken)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshTokenResponse.status).toBe(HttpStatus.Ok);
  });

  it(`should return ${HttpStatus.Unauthorized} if refresh token not passed`, async () => {
    const refreshTokenResponse = await request(app).post(Routes.AuthRefreshToken);
    expect(refreshTokenResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Unauthorized} if passed invalid refresh token`, async () => {
    const refreshToken = faker.internet.jwt();
    const refreshTokenResponse = await request(app)
      .post(Routes.AuthRefreshToken)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshTokenResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Unauthorized} if passed refresh token is expires`, async () => {
    const { input } = await usersTestManager.createUser();
    const loginResponse = await request(app).post(Routes.AuthLogin).send({
      loginOrEmail: input.login,
      password: input.password,
    });

    const setCookieHeader = loginResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    await sleep(JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS + 1);

    const refreshTokenResponse = await request(app)
      .post(Routes.AuthRefreshToken)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshTokenResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Unauthorized} if passed revoked refresh token`, async () => {
    const { input } = await usersTestManager.createUser();
    const loginResponse = await request(app).post(Routes.AuthLogin).send({
      loginOrEmail: input.login,
      password: input.password,
    });

    const setCookieHeader = loginResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    const refreshTokenResponse = await request(app)
      .post(Routes.AuthRefreshToken)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshTokenResponse.status).toBe(HttpStatus.Ok);

    const refreshTokenResponse2 = await request(app)
      .post(Routes.AuthRefreshToken)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshTokenResponse2.status).toBe(HttpStatus.Unauthorized);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

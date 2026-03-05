import { Express } from 'express';
import { Routes } from '../../../../../src/app/routes';
import { createApp } from '../../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../../src/core/types/HttpStatus';
import { InputUserType, ViewUserType } from '../../../../../src/entities/users/types';
import { closeBbConnection } from '../../../../../src/database/mongoDB';
import { authHeader } from '../../../../../src/core/constants';
import { faker } from '@faker-js/faker';
import { extractFromCookieArray } from '../../../../../src/core/utils/cookie/cookieUtils';
import { ISODateStringRegExp } from '../../../utils/constants';
import { InputLoginType } from '../../../../../src/entities/auth/types';

let app: Express;
let user: ViewUserType;

const inputUser: InputUserType = {
  login: 'AndrewK',
  email: 'andrew@mail.ru',
  password: 'Qwerty12345!',
};

const inputLoginData: InputLoginType = {
  loginOrEmail: inputUser.email,
  password: inputUser.password,
};

const expectedViewSecurityDevice = {
  ip: expect.any(String),
  title: expect.any(String),
  lastActiveDate: expect.stringMatching(ISODateStringRegExp),
  deviceId: expect.any(String),
};

const expectedViewSecurityDevices = expect.arrayContaining([expectedViewSecurityDevice]);

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  const createUserResponse = await request(app)
    .post(Routes.Users)
    .set('Authorization', authHeader)
    .send(inputUser);
  user = createUserResponse.body;
});

describe(`GET ${Routes.SecurityDevices}`, () => {
  it(`should return ${HttpStatus.Ok} status code and devices array`, async () => {
    const device1 = faker.internet.userAgent();
    const device2 = faker.internet.userAgent();

    const loginDevice1Response = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', device1)
      .send(inputLoginData);

    const loginDevice2Response = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', device2)
      .send(inputLoginData);

    const setCookieHeader = loginDevice1Response.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const refreshToken = extractFromCookieArray(cookies, 'refreshToken');

    const getDevicesResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(getDevicesResponse.status).toBe(HttpStatus.Ok);
    expect(getDevicesResponse.body).toEqual(expectedViewSecurityDevices);
    expect(getDevicesResponse.body).toHaveLength(2);
  });

});

afterAll(async () => {
  await closeBbConnection();
});

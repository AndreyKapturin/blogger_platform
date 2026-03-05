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

describe(`DELETE ${Routes.SecurityDevices}`, () => {
  it(`should return ${HttpStatus.No_Content} status code and delete other devices (exclude current)`, async () => {
    const currentDevice = faker.internet.userAgent();
    const otherDevice1 = faker.internet.userAgent();
    const otherDevice2 = faker.internet.userAgent();

    const loginCurrentDeviceResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', currentDevice)
      .send(inputLoginData);

    await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', otherDevice1)
      .send(inputLoginData);

    await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', otherDevice2)
      .send(inputLoginData);

    const setCookieHeader = loginCurrentDeviceResponse.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const currentDeviceRefreshToken = extractFromCookieArray(cookies, 'refreshToken');

    const getDevicesBeforeTerminateResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(getDevicesBeforeTerminateResponse.status).toBe(HttpStatus.Ok);
    expect(getDevicesBeforeTerminateResponse.body).toEqual(expectedViewSecurityDevices);
    expect(getDevicesBeforeTerminateResponse.body).toHaveLength(3);

    const terminateOtherDeviceResponse = await request(app)
      .delete(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(terminateOtherDeviceResponse.status).toBe(HttpStatus.No_Content);

    const getDevicesAfterTerminateResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(getDevicesAfterTerminateResponse.status).toBe(HttpStatus.Ok);
    expect(getDevicesAfterTerminateResponse.body).toEqual(expectedViewSecurityDevices);
    expect(getDevicesAfterTerminateResponse.body).toHaveLength(1);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

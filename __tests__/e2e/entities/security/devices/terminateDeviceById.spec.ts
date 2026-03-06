import { Express } from 'express';
import { Routes } from '../../../../../src/app/routes';
import { createApp } from '../../../../../src/app';
import request, { Response } from 'supertest';
import { HttpStatus } from '../../../../../src/core/types/HttpStatus';
import { closeBbConnection } from '../../../../../src/database/mongoDB';
import { faker } from '@faker-js/faker';
import { extractFromCookieArray } from '../../../../../src/core/utils/cookie/cookieUtils';
import { ISODateStringRegExp } from '../../../utils/constants';
import { decodeToken } from '../../../../../src/core/utils/jwt/jwtUtils';
import { createUsersTestManager, UsersTestManagerType } from '../../../utils/usersTestManager';
import { InputLoginType } from '../../../../../src/entities/auth/types';

let app: Express;
let usersTestManager: UsersTestManagerType;

beforeAll(async () => {
  app = await createApp();
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  usersTestManager = createUsersTestManager(app);
});

const expectedViewSecurityDevice = {
  ip: expect.any(String),
  title: expect.any(String),
  lastActiveDate: expect.stringMatching(ISODateStringRegExp),
  deviceId: expect.any(String),
};

const expectedViewSecurityDevices = expect.arrayContaining([expectedViewSecurityDevice]);

const extractRefreshToken = (response: Response) => {
  const setCookieHeader = response.headers['set-cookie'];
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return extractFromCookieArray(cookies, 'refreshToken');
};

describe(`DELETE ${Routes.SecurityDeviceById(':id')}`, () => {
  it(`should return ${HttpStatus.No_Content} status code and delete other device`, async () => {
    const { input: user } = await usersTestManager.createUser();
    const inputLoginData: InputLoginType = {
      loginOrEmail: user.email,
      password: user.password,
    };

    const currentDevice = faker.internet.userAgent();
    const otherDevice = faker.internet.userAgent();

    const loginCurrentDeviceResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', currentDevice)
      .send(inputLoginData);

    const loginOtherDeviceResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', otherDevice)
      .send(inputLoginData);

    const currentDeviceRefreshToken = extractRefreshToken(loginCurrentDeviceResponse);
    const otherDeviceRefreshToken = extractRefreshToken(loginOtherDeviceResponse);

    const { deviceId: currentDeviceId } = decodeToken(currentDeviceRefreshToken!);
    const { deviceId: otherDeviceId } = decodeToken(otherDeviceRefreshToken!);

    const getDevicesBeforeTerminateResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(getDevicesBeforeTerminateResponse.status).toBe(HttpStatus.Ok);
    expect(getDevicesBeforeTerminateResponse.body).toEqual(expectedViewSecurityDevices);
    expect(getDevicesBeforeTerminateResponse.body).toHaveLength(2);

    const terminateOtherDeviceResponse = await request(app)
      .delete(Routes.SecurityDeviceById(otherDeviceId))
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(terminateOtherDeviceResponse.status).toBe(HttpStatus.No_Content);

    const getDevicesAfterTerminateResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(getDevicesAfterTerminateResponse.status).toBe(HttpStatus.Ok);
    expect(getDevicesAfterTerminateResponse.body).toEqual(expectedViewSecurityDevices);
    expect(getDevicesAfterTerminateResponse.body).toHaveLength(1);
    expect(getDevicesAfterTerminateResponse.body[0].deviceId).toEqual(currentDeviceId);
  });

  it(`should return ${HttpStatus.No_Content} status code and delete current device`, async () => {
    const { input: user } = await usersTestManager.createUser();
    const inputLoginData: InputLoginType = {
      loginOrEmail: user.email,
      password: user.password,
    };

    const currentDevice = faker.internet.userAgent();

    const loginCurrentDeviceResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', currentDevice)
      .send(inputLoginData);

    const currentDeviceRefreshToken = extractRefreshToken(loginCurrentDeviceResponse);

    const { deviceId: currentDeviceId } = decodeToken(currentDeviceRefreshToken!);

    const getDevicesBeforeTerminateResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(getDevicesBeforeTerminateResponse.status).toBe(HttpStatus.Ok);
    expect(getDevicesBeforeTerminateResponse.body).toEqual(expectedViewSecurityDevices);
    expect(getDevicesBeforeTerminateResponse.body).toHaveLength(1);

    const terminateOtherDeviceResponse = await request(app)
      .delete(Routes.SecurityDeviceById(currentDeviceId))
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(terminateOtherDeviceResponse.status).toBe(HttpStatus.No_Content);

    const getDevicesAfterTerminateResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${currentDeviceRefreshToken}`);

    expect(getDevicesAfterTerminateResponse.status).toBe(HttpStatus.Unauthorized);
  });

  it(`should return ${HttpStatus.Forbidden} status code if device not belong to user`, async () => {
    const [{ input: currentUser }, { input: otherUser }] =
      await usersTestManager.createManyUsers(2);
    const currentUserDevice = faker.internet.userAgent();
    const otherUserDevice = faker.internet.userAgent();

    const currentUserLoginResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', currentUserDevice)
      .send({ loginOrEmail: currentUser.login, password: currentUser.password });

    const currentUserRefreshToken = extractRefreshToken(currentUserLoginResponse);

    const otherUserLoginResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', otherUserDevice)
      .send({ loginOrEmail: otherUser.login, password: otherUser.password });

    const otherUserRefreshToken = extractRefreshToken(otherUserLoginResponse);
    const { deviceId: otherUserDeviceId } = decodeToken(otherUserRefreshToken!);

    const terminateOtherUserDeviceResponse = await request(app)
      .delete(Routes.SecurityDeviceById(otherUserDeviceId))
      .set('Cookie', `refreshToken=${currentUserRefreshToken}`);

    expect(terminateOtherUserDeviceResponse.status).toBe(HttpStatus.Forbidden);

    const getOtherUserDevicesResponse = await request(app)
      .get(Routes.SecurityDevices)
      .set('Cookie', `refreshToken=${otherUserRefreshToken}`);

    expect(getOtherUserDevicesResponse.body).toHaveLength(1);
    expect(getOtherUserDevicesResponse.body[0].deviceId).toBe(otherUserDeviceId);
  });

  it(`should return ${HttpStatus.Not_Found} status code if device not exist`, async () => {
    const { input: user } = await usersTestManager.createUser();
    const userDevice = faker.internet.userAgent();

    const userLoginResponse = await request(app)
      .post(Routes.AuthLogin)
      .set('User-Agent', userDevice)
      .send({ loginOrEmail: user.login, password: user.password });

    const userRefreshToken = extractRefreshToken(userLoginResponse);
    const notExistedDeviceId = crypto.randomUUID();

    const terminateUserDeviceResponse = await request(app)
      .delete(Routes.SecurityDeviceById(notExistedDeviceId))
      .set('Cookie', `refreshToken=${userRefreshToken}`);

    expect(terminateUserDeviceResponse.status).toBe(HttpStatus.Not_Found);
  });
});

afterAll(async () => {
  await closeBbConnection();
});

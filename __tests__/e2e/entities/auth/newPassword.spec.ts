import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { createUsersTestManager, UsersTestManagerType } from '../../utils/usersTestManager';
import { emailService } from '../../../../src/compositionRoot';
import { InputLoginType, InputNewPassword } from '../../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import { sleep } from "../../utils/timeUtils";
import { PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS } from '../../../../src/core/config';

let app: Express;
let usersTestManager: UsersTestManagerType;

const sendPasswordRecoveryCodeSpyOn = jest
  .spyOn(emailService, 'sendPasswordRecoveryCode')
  .mockResolvedValue(true)
  .mockImplementation(() => Promise.resolve(true));

beforeAll(async () => {
  app = await createApp();
  usersTestManager = createUsersTestManager(app);
});

afterAll(async () => {
  await closeBbConnection();
  sendPasswordRecoveryCodeSpyOn.mockClear();
});

beforeEach(async () => {
  await request(app).delete(Routes.TestingAllData).expect(HttpStatus.No_Content);
  sendPasswordRecoveryCodeSpyOn.mockClear();
});

describe(`POST ${Routes.NewPassword}`, () => {
  it(`should return ${HttpStatus.No_Content} if code is valid and new password is accepted`, async () => {
    const { input } = await usersTestManager.createUser();
    const email = input.email;
    const oldPassword = input.password;

    const passwordRecoveryResponse = await request(app)
      .post(Routes.AuthPasswordRecovery)
      .send({ email });
    
    expect(passwordRecoveryResponse.status).toBe(HttpStatus.No_Content);

    const recoveryCode = sendPasswordRecoveryCodeSpyOn.mock.calls[0][1];
    const newPassword = faker.internet.password();

    const inputNewPassword: InputNewPassword = {
      newPassword,
      recoveryCode,
    };

    const newPasswordResponse = await request(app)
      .post(Routes.AuthNewPassword)
      .send(inputNewPassword);

    expect(newPasswordResponse.status).toBe(HttpStatus.No_Content);

    const inputLoginWithOldPassword: InputLoginType = {
      loginOrEmail: email,
      password: oldPassword,
    };

    const loginWithOldPasswordResponse = await request(app)
      .post(Routes.AuthLogin)
      .send(inputLoginWithOldPassword);

    expect(loginWithOldPasswordResponse.status).toBe(HttpStatus.Unauthorized);

    const inputLoginWithNewPassword: InputLoginType = {
      loginOrEmail: email,
      password: newPassword,
    };

    const loginWithNewPasswordResponse = await request(app)
      .post(Routes.AuthLogin)
      .send(inputLoginWithNewPassword);

    expect(loginWithNewPasswordResponse.status).toBe(HttpStatus.Ok);
  });

  it(`should return ${HttpStatus.Bad_Request} if recovery code is invalid`, async () => {
    const recoveryCode = '';
    const newPassword = faker.internet.password();

    const inputNewPassword: InputNewPassword = {
      newPassword,
      recoveryCode,
    };

    const newPasswordResponse = await request(app)
      .post(Routes.AuthNewPassword)
      .send(inputNewPassword);

    expect(newPasswordResponse.status).toBe(HttpStatus.Bad_Request);
  });

  it(`should return ${HttpStatus.Bad_Request} if recovery code is expired`, async () => {
    const { input } = await usersTestManager.createUser();
    const email = input.email;
    const oldPassword = input.password;

    const passwordRecoveryResponse = await request(app)
      .post(Routes.AuthPasswordRecovery)
      .send({ email });

    const recoveryCode = sendPasswordRecoveryCodeSpyOn.mock.calls[0][1];
    const newPassword = faker.internet.password();

    const inputNewPassword: InputNewPassword = {
      newPassword,
      recoveryCode,
    };

    await sleep(PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS + 1);

    const newPasswordResponse = await request(app)
      .post(Routes.AuthNewPassword)
      .send(inputNewPassword);

    expect(newPasswordResponse.status).toBe(HttpStatus.Bad_Request);

    const inputLoginWithOldPassword: InputLoginType = {
      loginOrEmail: email,
      password: oldPassword,
    };

    const loginWithOldPasswordResponse = await request(app)
      .post(Routes.AuthLogin)
      .send(inputLoginWithOldPassword);

    expect(loginWithOldPasswordResponse.status).toBe(HttpStatus.Ok);

    const inputLoginWithNewPassword: InputLoginType = {
      loginOrEmail: email,
      password: newPassword,
    };

    const loginWithNewPasswordResponse = await request(app)
      .post(Routes.AuthLogin)
      .send(inputLoginWithNewPassword);

    expect(loginWithNewPasswordResponse.status).toBe(HttpStatus.Unauthorized);
  });
});

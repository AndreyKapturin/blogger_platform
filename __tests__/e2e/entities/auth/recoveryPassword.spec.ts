import { Express } from 'express';
import { Routes } from '../../../../src/app/routes';
import { createApp } from '../../../../src/app';
import request from 'supertest';
import { HttpStatus } from '../../../../src/core/types/HttpStatus';
import { closeBbConnection } from '../../../../src/database/mongoDB';
import { createUsersTestManager, UsersTestManagerType } from '../../utils/usersTestManager';
import { emailService } from '../../../../src/compositionRoot';

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

describe(`POST ${Routes.AuthPasswordRecovery}`, () => {
  it(`should return ${HttpStatus.No_Content} if email is valid and user exist`, async () => {
    const { input } = await usersTestManager.createUser();

    const passwordRecoveryResponse = await request(app)
      .post(Routes.AuthPasswordRecovery)
      .send({ email: input.email });

    expect(passwordRecoveryResponse.status).toBe(HttpStatus.No_Content);
    expect(sendPasswordRecoveryCodeSpyOn).toHaveBeenCalledTimes(1);
  });

  it(`should return ${HttpStatus.No_Content} if email is valid and user not exist`, async () => {
    const notExistedEmail = 'notexist@mail.ru';

    const passwordRecoveryResponse = await request(app)
      .post(Routes.AuthPasswordRecovery)
      .send({ email: notExistedEmail });

    expect(passwordRecoveryResponse.status).toBe(HttpStatus.No_Content);
    expect(sendPasswordRecoveryCodeSpyOn).not.toHaveBeenCalled();
  });

  it(`should return ${HttpStatus.Bad_Request} if email is invalid`, async () => {
    const invalidEmail = 'invalid_email';

    const passwordRecoveryResponse = await request(app)
      .post(Routes.AuthPasswordRecovery)
      .send({ email: invalidEmail });

    expect(passwordRecoveryResponse.status).toBe(HttpStatus.Bad_Request);
    expect(sendPasswordRecoveryCodeSpyOn).not.toHaveBeenCalled();
  });
});

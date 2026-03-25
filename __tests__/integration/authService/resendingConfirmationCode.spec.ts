import { container } from '../../../src/compositionRoot';
import { InputRegistrationType } from '../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import {
  MAX_USER_LOGIN_LENGTH,
  MIN_USER_LOGIN_LENGTH,
} from '../../../src/entities/users/constants';

import { closeBbConnection, connectToDB } from '../../../src/database/mongoDB';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ResultStatus } from '../../../src/core/utils/Result';
import { AuthService } from '../../../src/entities/auth/application/authService';
import { EmailService } from '../../../src/core/services/emailService';
import { UserModel } from '../../../src/entities/users/domain/UserModel';

const authService = container.get(AuthService);
const emailService = container.get(EmailService);

let mongoMemoryServer: MongoMemoryServer;

const sendConfirmationCodeSpyOn = jest
  .spyOn(emailService, 'sendConfirmationCode')
  .mockResolvedValue(true)
  .mockImplementation(() => Promise.resolve(true));

beforeAll(async () => {
  mongoMemoryServer = await MongoMemoryServer.create();
  await connectToDB(mongoMemoryServer.getUri());
});

beforeEach(async () => {
  await UserModel.deleteMany();
  sendConfirmationCodeSpyOn.mockClear();
});

afterAll(async () => {
  await mongoMemoryServer.stop();
  await closeBbConnection();
});

const getInputRegistratonData = (): InputRegistrationType => {
  return {
    email: faker.internet.email(),
    login: faker.string.alphanumeric({
      length: { min: MIN_USER_LOGIN_LENGTH, max: MAX_USER_LOGIN_LENGTH },
    }),
    password: faker.internet.password(),
  };
};

describe('AuthService.resendingConfirmationCode', () => {
  it(`should return ${ResultStatus.Success} result and save new code in database if user exist and not confirmed`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);

    const userInDatabase = await UserModel.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    const resendingConfirmationCodeResult = await authService.resendingConfirmationCode(
      inputCredentials.email,
    );

    const userInDatabaseAfterResendCode = await UserModel.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    expect(resendingConfirmationCodeResult.status).toBe(ResultStatus.Success);
    expect(userInDatabase!.emailConfirmation.code).not.toBe(
      userInDatabaseAfterResendCode!.emailConfirmation.code,
    );
    expect(sendConfirmationCodeSpyOn).toHaveBeenCalledTimes(2);
  });

  it(`should return ${ResultStatus.InvalidData} if user not exist`, async () => {
    const unexistedEmail = 'unexisted@mail.ru';
    const resendingConfirmationCodeResult =
      await authService.resendingConfirmationCode(unexistedEmail);

    expect(resendingConfirmationCodeResult.status).toBe(ResultStatus.InvalidData);
    expect(resendingConfirmationCodeResult.extensions).toEqual([
      { field: 'email', message: expect.any(String) },
    ]);
  });

  it(`should return ${ResultStatus.InvalidData} if user is confirmed`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);

    await UserModel.updateOne(
      { login: inputCredentials.login },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );

    const resendingConfirmationCodeResult = await authService.resendingConfirmationCode(
      inputCredentials.email,
    );

    expect(resendingConfirmationCodeResult.status).toBe(ResultStatus.InvalidData);
    expect(resendingConfirmationCodeResult.extensions).toEqual([
      { field: 'email', message: expect.any(String) },
    ]);
  });
});

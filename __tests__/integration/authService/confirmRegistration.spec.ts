import { container } from '../../../src/compositionRoot';
import { InputRegistrationType } from '../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import {
  MAX_USER_LOGIN_LENGTH,
  MIN_USER_LOGIN_LENGTH,
} from '../../../src/entities/users/constants';
import { ResultStatus } from '../../../src/core/utils/Result';
import { closeBbConnection, connectToDB } from '../../../src/database/mongoDB';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthService } from '../../../src/entities/auth/application/authService';
import { EmailService } from '../../../src/core/services/emailService';
import { UserModel } from '../../../src/entities/users/domain/UserModel';
import { dateUtils } from '../../../src/core/utils/date/dateUtils';

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

describe('AuthService.confirmRegistration', () => {
  it(`should return ${ResultStatus.Success} result and set confirmation status in database as true`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);

    const userInDatabase = await UserModel.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    const confirmRegistrationResult = await authService.confirmRegistration(
      userInDatabase!.emailConfirmation.code,
    );

    const userInDatabaseAfterConfirmation = await UserModel.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    expect(confirmRegistrationResult.status).toBe(ResultStatus.Success);
    expect(userInDatabase!.emailConfirmation.isConfirmed).toBe(false);
    expect(userInDatabaseAfterConfirmation!.emailConfirmation.isConfirmed).toBe(true);
  });

  it(`should return ${ResultStatus.InvalidData} if confirmation code not exist`, async () => {
    const unexistedConfirmationCode = crypto.randomUUID();
    const confirmRegistrationResult =
      await authService.confirmRegistration(unexistedConfirmationCode);

    expect(confirmRegistrationResult.status).toBe(ResultStatus.InvalidData);
    expect(confirmRegistrationResult.extensions).toEqual([
      { field: 'code', message: expect.any(String) },
    ]);
  });

  it(`should return ${ResultStatus.InvalidData} if user is confirmed`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);

    const userInDatabase = await UserModel.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    await UserModel.updateOne(
      { login: inputCredentials.login },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );

    const confirmRegistrationResult = await authService.confirmRegistration(
      userInDatabase!.emailConfirmation.code,
    );

    expect(confirmRegistrationResult.status).toBe(ResultStatus.InvalidData);
    expect(confirmRegistrationResult.extensions).toEqual([
      { field: 'code', message: expect.any(String) },
    ]);
  });

  it(`should return ${ResultStatus.InvalidData} if confirmation code is expired`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);

    const userInDatabase = await UserModel.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    await UserModel.updateOne(
      { login: inputCredentials.login },
      { $set: { 'emailConfirmation.codeExpirationDate': dateUtils.getDateMinusMinutes(1) } },
    );

    const confirmRegistrationResult = await authService.confirmRegistration(
      userInDatabase!.emailConfirmation.code,
    );

    expect(confirmRegistrationResult.status).toBe(ResultStatus.InvalidData);
    expect(confirmRegistrationResult.extensions).toEqual([
      { field: 'code', message: expect.any(String) },
    ]);
  });
});

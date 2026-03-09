import { emailService } from '../../../src/core/services/emailService';
import { InputRegistrationType } from '../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import {
  MAX_USER_LOGIN_LENGTH,
  MIN_USER_LOGIN_LENGTH,
} from '../../../src/entities/users/constants';
import { ResultStatus } from '../../../src/core/utils/Result';
import { closeBbConnection, connectToDB, usersCollection } from '../../../src/database/mongoDB';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { authService } from '../../../src/compositionRoot';

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
  await usersCollection.deleteMany();
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

describe('AuthService.registration', () => {
  it(`should return ${ResultStatus.Success} result and save user in database if input data is correct`, async () => {
    const inputCredentials = getInputRegistratonData();
    const registrationResult = await authService.registration(inputCredentials);
    const userInDatabase = await usersCollection.findOne({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    expect(registrationResult.status).toBe(ResultStatus.Success);
    expect(userInDatabase).toBeTruthy();
    expect(sendConfirmationCodeSpyOn).toHaveBeenCalled();
  });

  it(`should return ${ResultStatus.InvalidData} result if login or email is busy`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);
    const repeatedEmailRegistrationResult = await authService.registration({
      ...inputCredentials,
      login: getInputRegistratonData().login,
    });
    const repeatedLoginRegistrationResult = await authService.registration({
      ...inputCredentials,
      email: getInputRegistratonData().email,
    });

    const userInDatabaseCount = await usersCollection.countDocuments({
      $or: [{ login: inputCredentials.login }, { email: inputCredentials.email }],
    });

    expect(repeatedEmailRegistrationResult.status).toBe(ResultStatus.InvalidData);
    expect(repeatedEmailRegistrationResult.extensions).toEqual([
      { field: 'email', message: expect.any(String) },
    ]);
    expect(repeatedLoginRegistrationResult.status).toBe(ResultStatus.InvalidData);
    expect(repeatedLoginRegistrationResult.extensions).toEqual([
      { field: 'login', message: expect.any(String) },
    ]);
    expect(userInDatabaseCount).toBe(1);
    expect(sendConfirmationCodeSpyOn).toHaveBeenCalledTimes(1);
  });
});

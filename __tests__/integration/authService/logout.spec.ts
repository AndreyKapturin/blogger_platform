import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  closeBbConnection,
  connectToDB,
  sessionsCollection,
  usersCollection,
} from '../../../src/database/mongoDB';
import { Result, ResultStatus } from '../../../src/core/utils/Result';
import { InputAuthData, InputRegistrationType } from '../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import {
  MAX_USER_LOGIN_LENGTH,
  MIN_USER_LOGIN_LENGTH,
} from '../../../src/entities/users/constants';
import { emailService } from '../../../src/core/services/emailService';
import { authService, jwtService } from '../../../src/compositionRoot';

let mongoMemoryServer: MongoMemoryServer;

const sendConfirmationCodeSpyOn = jest
  .spyOn(emailService, 'sendConfirmationCode')
  .mockResolvedValue(true)
  .mockImplementation(() => Promise.resolve(true));

const getInputRegistratonData = (): InputRegistrationType => {
  return {
    email: faker.internet.email(),
    login: faker.string.alphanumeric({
      length: { min: MIN_USER_LOGIN_LENGTH, max: MAX_USER_LOGIN_LENGTH },
    }),
    password: faker.internet.password(),
  };
};

const isSuccessResult = <T>(result: Result<T>) => result.status === ResultStatus.Success;

beforeAll(async () => {
  mongoMemoryServer = await MongoMemoryServer.create();
  await connectToDB(mongoMemoryServer.getUri());
});

beforeEach(async () => {
  await usersCollection.deleteMany();
  await sessionsCollection.deleteMany();
});

afterAll(async () => {
  await mongoMemoryServer.stop();
  await closeBbConnection();
});

describe('AuthService.logout', () => {
  it('should remove session for current device', async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);

    const inputAuthData: InputAuthData = {
      credentials: {
        loginOrEmail: inputCredentials.login,
        password: inputCredentials.password,
      },
      requestDevice: {
        deviceName: 'MacOS Chrome',
        ip: faker.internet.ipv4(),
      },
    };

    const loginResult = await authService.login(inputAuthData);

    if (!isSuccessResult(loginResult)) {
      expect(loginResult.status).toBe(ResultStatus.Success);
      return;
    }

    const refreshToken = loginResult.data.refreshToken;
    const tokenPayload = jwtService.decodeToken(refreshToken);
    const deviceId = tokenPayload.deviceId;
    const issuedDate = new Date(tokenPayload.iat * 1000);

    const documentsCountAfterLogin = await sessionsCollection.countDocuments({
      $and: [{ deviceId }, { issuedDate }],
    });

    expect(documentsCountAfterLogin).toBe(1);

    const logoutResult = await authService.logout(refreshToken);

    if (!isSuccessResult(logoutResult)) {
      expect(logoutResult.status).toBe(ResultStatus.Success);
      return;
    }

    const documentsCountAfterLogout = await sessionsCollection.countDocuments({
      $and: [{ deviceId }, { issuedDate }],
    });

    expect(documentsCountAfterLogout).toBe(0);
  });
});

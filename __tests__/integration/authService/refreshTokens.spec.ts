import { MongoMemoryServer } from 'mongodb-memory-server';
import { authService } from '../../../src/entities/auth/application/authService';
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
import { jwtService } from '../../../src/core/utils/jwt/jwtUtils';
import { sleep } from "../../e2e/utils/timeUtils";

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

describe('AuthService.refreshTokens', () => {
  it('should return new JWT tokens pair and update session', async () => {
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

    const firstRefreshToken = loginResult.data.refreshToken;

    await sleep(1);

    const refreshTokensResult = await authService.refreshTokens(firstRefreshToken);

    if (!isSuccessResult(refreshTokensResult)) {
      expect(refreshTokensResult.status).toBe(ResultStatus.Success);
      return;
    }

    expect(refreshTokensResult.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    const tokenPayload = jwtService.decodeToken(firstRefreshToken);
    const deviceId = tokenPayload.deviceId;

    const deviceSession = await sessionsCollection.findOne({ deviceId });

    const prevSessionIssuedDate = tokenPayload.iat * 1000;
    const prevSessionExpirationDate = tokenPayload.exp * 1000;
    const nowSessionIssuedDate = deviceSession!.issuedDate.getTime();
    const nowSessionExpirationDate = deviceSession!.expirationDate.getTime();

    expect(deviceSession).not.toBeNull();
    expect(nowSessionIssuedDate).toBeGreaterThan(prevSessionIssuedDate);
    expect(nowSessionExpirationDate).toBeGreaterThan(prevSessionExpirationDate);
  });
});

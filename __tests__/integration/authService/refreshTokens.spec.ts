import { MongoMemoryServer } from 'mongodb-memory-server';
import { authService } from '../../../src/entities/auth/application/authService';
import {
  closeBbConnection,
  connectToDB,
  revokedRefreshTokensCollection,
  usersCollection,
} from '../../../src/database/mongoDB';
import { Result, ResultStatus } from '../../../src/core/types/Result';
import { InputRegistrationType } from '../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import {
  MAX_USER_LOGIN_LENGTH,
  MIN_USER_LOGIN_LENGTH,
} from '../../../src/entities/users/constants';

let mongoMemoryServer: MongoMemoryServer;

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
  await revokedRefreshTokensCollection.deleteMany();
});

afterAll(async () => {
  await mongoMemoryServer.stop();
  await closeBbConnection();
});

describe('AuthService.refreshTokens', () => {
  it('should return new JWT tokens pair and save previous token in black list', async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);
    const loginResult = await authService.login({
      loginOrEmail: inputCredentials.login,
      password: inputCredentials.password,
    });

    if (!isSuccessResult(loginResult)) {
      expect(loginResult.status).toBe(ResultStatus.Success);
      return;
    }

    const firstRefreshToken = loginResult.data.refreshToken;

    const refreshTokensResult = await authService.refreshTokens(firstRefreshToken);

    if (!isSuccessResult(refreshTokensResult)) {
      expect(refreshTokensResult.status).toBe(ResultStatus.Success);
      return;
    }

    expect(refreshTokensResult.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    const foundRevokedRefreshToken = await revokedRefreshTokensCollection
      .findOne({ token: firstRefreshToken });

    expect(foundRevokedRefreshToken).not.toBeNull();
  });
});

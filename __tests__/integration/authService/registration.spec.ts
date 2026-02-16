import { emailService } from "../../../src/core/services/emailService";
import { authService } from '../../../src/entities/auth/application/authService';
import { InputRegistrationType } from '../../../src/entities/auth/types';
import { faker } from '@faker-js/faker';
import { MAX_USER_LOGIN_LENGTH, MIN_USER_LOGIN_LENGTH } from '../../../src/entities/users/constants';
import { ResultStatus } from "../../../src/core/types/Result";
import { closeBbConnection, connectToDB, usersCollection } from "../../../src/database/mongoDB";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer;

const sendConfirmationCodeSpyOn = jest
  .spyOn(emailService, 'sendConfirmationCode')
  .mockResolvedValue(true)
  .mockImplementation(() => Promise.resolve(true));

beforeAll(async () => {
  mongoMemoryServer = await MongoMemoryServer.create();
  await connectToDB(mongoMemoryServer.getUri());
})

beforeEach(async () => {
  await usersCollection.deleteMany();
  sendConfirmationCodeSpyOn.mockClear();
})

afterAll(async () => {
  await mongoMemoryServer.stop();
  await closeBbConnection()
})

const getInputRegistratonData = (): InputRegistrationType => {
  return {
    email: faker.internet.email(),
    login: faker.string.alphanumeric({ length: { min: MIN_USER_LOGIN_LENGTH, max: MAX_USER_LOGIN_LENGTH } }),
    password: faker.internet.password()
  }
}

describe('AuthService.registration', () => {
  it(`should return ${ResultStatus.Success} result and save user in database if input data is correct`, async () => {
    const inputCredentials = getInputRegistratonData();
    const registrationResult = await authService.registration(inputCredentials);
    const userInDatabase = await usersCollection.findOne({
      $or: [
        { login: inputCredentials.login },
        { email: inputCredentials.email }
      ]
    })
    
    expect(registrationResult.status).toBe(ResultStatus.Success);
    expect(userInDatabase).toBeTruthy();
    expect(sendConfirmationCodeSpyOn).toHaveBeenCalled();
  });

  it(`should return ${ResultStatus.InvalidData} result if login is busy`, async () => {
    const inputCredentials = getInputRegistratonData();
    await authService.registration(inputCredentials);
    const repeatedRegistrationResult = await authService.registration(inputCredentials);
    
    const userInDatabaseCount = await usersCollection.countDocuments({
      $or: [
        { login: inputCredentials.login },
        { email: inputCredentials.email }
      ]
    })
    
    expect(repeatedRegistrationResult.status).toBe(ResultStatus.InvalidData);
    expect(userInDatabaseCount).toBe(1);
    expect(sendConfirmationCodeSpyOn).toHaveBeenCalledTimes(1);
  });

});

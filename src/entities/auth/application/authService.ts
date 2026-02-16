import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/types/Result';
import { InputLoginType, InputRegistrationType } from '../types';
import { comparePassword } from '../../../core/utils/crypto/passwordUtils';
import { createAccessToken } from '../../../core/utils/jwt/jwtUtils';
import { UserFactory } from '../../users/UserFactory';
import { emailService } from '../../../core/services/emailService';
import { log } from '../../../core/utils/logger/loggerUtils';

const login = async (credentials: InputLoginType): Promise<Result<string>> => {
  const user = await usersCommandRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

  if (!user) {
    return {
      status: ResultStatus.InvalidCredentials,
      errorMessage: 'Invalid credentials',
      extensions: [
        {
          field: null,
          message: 'Invalid credentials',
        },
      ],
    };
  }

  const isValidPassword = await comparePassword(credentials.password, user.passwordHash);

  if (!isValidPassword) {
    return {
      status: ResultStatus.InvalidCredentials,
      errorMessage: 'Invalid credentials',
      extensions: [
        {
          field: null,
          message: 'Invalid credentials',
        },
      ],
    };
  }

  const accessToken = await createAccessToken({ userId: user.id });

  return {
    status: ResultStatus.Success,
    data: accessToken,
    extensions: [],
  };
};

const registration = async (credentials: InputRegistrationType): Promise<Result> => {
  const isUserExist = await usersCommandRepository.checkUserByLoginOrEmail(
    credentials.login,
    credentials.email,
  );

  if (isUserExist) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'User with passed credentials already exists',
      extensions: [
        {
          field: null,
          message: 'User with passed credentials already exists',
        },
      ],
    };
  }

  const newUser = await UserFactory.createUnconfirmedUser(
    credentials.email,
    credentials.login,
    credentials.password,
  );

  await usersCommandRepository.save(newUser);

  emailService.sendConfirmationCode(newUser.email, newUser.emailConfirmation.code)
    .catch((error) => log('Send confirmation code error: ', error));

  return {
    status: ResultStatus.Success,
    data: null,
    extensions: [],
  };
};

const authService = {
  login,
  registration,
};

export { authService };

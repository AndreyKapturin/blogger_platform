import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/types/Result';
import { InputLoginType, InputRegistrationType } from '../types';
import { comparePassword } from '../../../core/utils/crypto/passwordUtils';
import { createAccessAndRefreshTokens } from '../../../core/utils/jwt/jwtUtils';
import { UserFactory } from '../../users/UserFactory';
import { emailService } from '../../../core/services/emailService';
import { log } from '../../../core/utils/logger/loggerUtils';
import { dateUtils } from '../../../core/utils/date/dateUtils';
import { JwtTokensPair } from '../../../core/types/JwtTokens';

const login = async (credentials: InputLoginType): Promise<Result<JwtTokensPair>> => {
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

  const jwtTokensPair = await createAccessAndRefreshTokens({ userId: user.id });

  return {
    status: ResultStatus.Success,
    data: jwtTokensPair,
    extensions: [],
  };
};

const registration = async (credentials: InputRegistrationType): Promise<Result> => {
  let isUserExist = await usersCommandRepository.checkUserByEmail(credentials.email);

  if (isUserExist) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'User with passed email already exists',
      extensions: [
        {
          field: 'email',
          message: 'User with passed email already exists',
        },
      ],
    };
  }

  isUserExist = await usersCommandRepository.checkUserByLogin(credentials.login);

  if (isUserExist) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'User with passed login already exists',
      extensions: [
        {
          field: 'login',
          message: 'User with passed login already exists',
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

  emailService
    .sendConfirmationCode(newUser.email, newUser.emailConfirmation.code)
    .catch((error) => log('Send confirmation code error: ', error));

  return {
    status: ResultStatus.Success,
    data: null,
    extensions: [],
  };
};

const resendingConfirmationCode = async (email: string): Promise<Result> => {
  const user = await usersCommandRepository.findUserByLoginOrEmail(email);

  if (!user) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'User with passed email not exists',
      extensions: [
        {
          field: 'email',
          message: 'User with passed email not exists',
        },
      ],
    };
  }

  if (user.emailConfirmation.isConfirmed) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'Email is already confirmed',
      extensions: [
        {
          field: 'email',
          message: 'Email is already confirmed',
        },
      ],
    };
  }

  const newConfirmationCode = crypto.randomUUID();
  const newCodeExpirationDate = dateUtils.getEmailConfirmationCodeExpirationDate();

  await usersCommandRepository.updateEmailConfirmationCode(
    user.id,
    newConfirmationCode,
    newCodeExpirationDate,
  );

  emailService
    .sendConfirmationCode(user.email, newConfirmationCode)
    .catch((error) => log('Send confirmation code error: ', error));

  return {
    status: ResultStatus.Success,
    data: null,
    extensions: [],
  };
};

const confirmRegistration = async (emailConfirmationCode: string): Promise<Result> => {
  const user = await usersCommandRepository.findUserByEmailConfirmationCode(emailConfirmationCode);

  if (!user) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'User with passed confirmation code not exist',
      extensions: [
        {
          field: 'code',
          message: 'User with passed confirmation code not exist',
        },
      ],
    };
  }

  if (user.emailConfirmation.isConfirmed) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'Email is already confirmed',
      extensions: [
        {
          field: 'code',
          message: 'Email is already confirmed',
        },
      ],
    };
  }

  const isExpiredCode = dateUtils.dateIsExpired(user.emailConfirmation.codeExpirationDate);

  if (isExpiredCode) {
    return {
      status: ResultStatus.InvalidData,
      errorMessage: 'Confirmation code is expired',
      extensions: [
        {
          field: 'code',
          message: 'Confirmation code is expired',
        },
      ],
    };
  }

  await usersCommandRepository.confirmEmail(user.email);

  return {
    status: ResultStatus.Success,
    data: null,
    extensions: [],
  };
};

const authService = {
  login,
  registration,
  resendingConfirmationCode,
  confirmRegistration,
};

export { authService };

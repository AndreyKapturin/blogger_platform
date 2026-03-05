import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { InputAuthData, InputRegistrationType, Session } from '../types';
import { comparePassword } from '../../../core/utils/crypto/passwordUtils';
import {
  createAccessAndRefreshTokens,
  decodeToken,
  getTokenIatAndExpDate,
} from '../../../core/utils/jwt/jwtUtils';
import { UserFactory } from '../../users/UserFactory';
import { emailService } from '../../../core/services/emailService';
import { log } from '../../../core/utils/logger/loggerUtils';
import { dateUtils } from '../../../core/utils/date/dateUtils';
import { JwtTokensPair } from '../types';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { sessionCommandRepository } from '../repositories/sessionCommandRepository';

const login = async (inputAuthData: InputAuthData): Promise<Result<JwtTokensPair>> => {
  const { credentials, requestDevice } = inputAuthData;
  const user = await usersCommandRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

  if (!user) {
    return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'Invalid credentials', [
      {
        field: null,
        message: 'Invalid credentials',
      },
    ]);
  }

  const isValidPassword = await comparePassword(credentials.password, user.passwordHash);

  if (!isValidPassword) {
    return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'Invalid credentials', [
      {
        field: null,
        message: 'Invalid credentials',
      },
    ]);
  }

  const deviceId = crypto.randomUUID();
  const jwtTokensPair = await createAccessAndRefreshTokens({ userId: user.id, deviceId });

  const { issuedDate, expirationDate } = getTokenIatAndExpDate(jwtTokensPair.refreshToken);

  const session: Session = {
    userId: user.id,
    deviceId,
    issuedDate,
    deviceName: requestDevice.deviceName,
    ip: requestDevice.ip,
    expirationDate,
  };

  await sessionCommandRepository.save(session);

  return ResultFactory.success(jwtTokensPair);
};

const registration = async (credentials: InputRegistrationType): Promise<Result<string>> => {
  let isUserExist = await usersCommandRepository.checkUserByEmail(credentials.email);

  if (isUserExist) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exists', [
      {
        field: 'email',
        message: 'User with passed email already exists',
      },
    ]);
  }

  isUserExist = await usersCommandRepository.checkUserByLogin(credentials.login);

  if (isUserExist) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exists', [
      {
        field: 'login',
        message: 'User with passed login already exists',
      },
    ]);
  }

  const newUser = await UserFactory.createUnconfirmedUser(
    credentials.email,
    credentials.login,
    credentials.password,
  );

  const createdUserId = await usersCommandRepository.save(newUser);

  emailService
    .sendConfirmationCode(newUser.email, newUser.emailConfirmation.code)
    .catch((error) => log('Send confirmation code error: ', error));

  return ResultFactory.success(createdUserId);
};

const resendingConfirmationCode = async (email: string): Promise<Result> => {
  const user = await usersCommandRepository.findUserByLoginOrEmail(email);

  if (!user) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'User not found', [
      {
        field: 'email',
        message: 'User with passed email not exists',
      },
    ]);
  }

  if (user.emailConfirmation.isConfirmed) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'Email is already confirmed', [
      {
        field: 'email',
        message: 'Email is already confirmed',
      },
    ]);
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

  return ResultFactory.success(null);
};

const confirmRegistration = async (emailConfirmationCode: string): Promise<Result> => {
  const user = await usersCommandRepository.findUserByEmailConfirmationCode(emailConfirmationCode);

  if (!user) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'User not found', [
      {
        field: 'code',
        message: 'User with passed confirmation code not exist',
      },
    ]);
  }

  if (user.emailConfirmation.isConfirmed) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'Email is already confirmed', [
      {
        field: 'code',
        message: 'Email is already confirmed',
      },
    ]);
  }

  const isExpiredCode = dateUtils.dateIsExpired(user.emailConfirmation.codeExpirationDate);

  if (isExpiredCode) {
    return ResultFactory.wrong(ResultStatus.InvalidData, 'Confirmation code is expired', [
      {
        field: 'code',
        message: 'Confirmation code is expired',
      },
    ]);
  }

  await usersCommandRepository.confirmEmail(user.email);

  return ResultFactory.success(null);
};

const refreshTokens = async (refreshToken: string): Promise<Result<JwtTokensPair>> => {
  const tokenPayload = decodeToken(refreshToken);
  const jwtTokensPair = await createAccessAndRefreshTokens({
    deviceId: tokenPayload.deviceId,
    userId: tokenPayload.userId,
  });

  const { issuedDate, expirationDate } = getTokenIatAndExpDate(jwtTokensPair.refreshToken);

  await sessionCommandRepository.updateSessionIatAndExpDate(
    tokenPayload.deviceId,
    issuedDate,
    expirationDate,
  );

  return ResultFactory.success(jwtTokensPair);
};

const logout = async (refreshToken: string): Promise<Result> => {
  const tokenPayload = decodeToken(refreshToken);
  await sessionCommandRepository.deleteSessionByDeviceId(tokenPayload.deviceId);
  return ResultFactory.success(null);
};

const authService = {
  logout,
  login,
  registration,
  resendingConfirmationCode,
  confirmRegistration,
  refreshTokens,
};

export { authService };

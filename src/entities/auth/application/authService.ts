import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { InputAuthData, InputRegistrationType, Session } from '../types';
import { CryptoService } from '../../../core/utils/crypto/passwordUtils';
import { JwtService } from '../../../core/utils/jwt/jwtUtils';
import { UsersFactory } from '../../users/UsersFactory';
import { EmailService } from '../../../core/services/emailService';
import { log } from '../../../core/utils/logger/loggerUtils';
import { dateUtils } from '../../../core/utils/date/dateUtils';
import { JwtTokensPair } from '../types';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { SessionsCommandRepository } from '../repositories/sessionsCommandRepository';
import { RecoveryCodesCommandRepository } from '../repositories/RecoveryCodesCommandRepository';
import { RecoveryCode } from '../RecoveryCode';
import { inject, injectable } from 'inversify';

@injectable()
class AuthService {
  constructor(
    @inject(UsersCommandRepository)
    private usersCommandRepository: UsersCommandRepository,
    @inject(CryptoService)
    private cryptoService: CryptoService,
    @inject(JwtService)
    private jwtService: JwtService,
    @inject(SessionsCommandRepository)
    private sessionsCommandRepository: SessionsCommandRepository,
    @inject(EmailService)
    private emailService: EmailService,
    @inject(RecoveryCodesCommandRepository)
    private recoveryCodesCommandRepository: RecoveryCodesCommandRepository,
    @inject(UsersFactory)
    private usersFactory: UsersFactory
  ) {}

  async login(inputAuthData: InputAuthData): Promise<Result<JwtTokensPair>> {
    const { credentials, requestDevice } = inputAuthData;
    const user = await this.usersCommandRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

    if (!user) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'Invalid credentials', [
        {
          field: null,
          message: 'Invalid credentials',
        },
      ]);
    }

    const isValidPassword = await this.cryptoService.comparePassword(
      credentials.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'Invalid credentials', [
        {
          field: null,
          message: 'Invalid credentials',
        },
      ]);
    }

    const deviceId = crypto.randomUUID();
    const jwtTokensPair = await this.jwtService.createAccessAndRefreshTokens({
      userId: user.id,
      deviceId,
    });

    const { issuedDate, expirationDate } = this.jwtService.getTokenIatAndExpDate(
      jwtTokensPair.refreshToken,
    );

    const session: Session = {
      userId: user.id,
      deviceId,
      issuedDate,
      deviceName: requestDevice.deviceName,
      ip: requestDevice.ip,
      expirationDate,
    };

    await this.sessionsCommandRepository.save(session);

    return ResultFactory.success(jwtTokensPair);
  }

  async registration(credentials: InputRegistrationType): Promise<Result<string>> {
    let isUserExist = await this.usersCommandRepository.checkUserByEmail(credentials.email);

    if (isUserExist) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exists', [
        {
          field: 'email',
          message: 'User with passed email already exists',
        },
      ]);
    }

    isUserExist = await this.usersCommandRepository.checkUserByLogin(credentials.login);

    if (isUserExist) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exists', [
        {
          field: 'login',
          message: 'User with passed login already exists',
        },
      ]);
    }

    const passwordHash = await this.cryptoService.hashPassword(credentials.password);

    const newUser = await this.usersFactory.createUnconfirmedUser(
      credentials.email,
      credentials.login,
      credentials.password,
    );

    const createdUserId = await this.usersCommandRepository.save(newUser);

    this.emailService
      .sendConfirmationCode(newUser.email, newUser.emailConfirmation.code)
      .catch((error) => log('Send confirmation code error: ', error));

    return ResultFactory.success(createdUserId);
  }

  async resendingConfirmationCode(email: string): Promise<Result> {
    const user = await this.usersCommandRepository.findUserByLoginOrEmail(email);

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

    await this.usersCommandRepository.updateEmailConfirmationCode(
      user.id,
      newConfirmationCode,
      newCodeExpirationDate,
    );

    this.emailService
      .sendConfirmationCode(user.email, newConfirmationCode)
      .catch((error) => log('Send confirmation code error: ', error));

    return ResultFactory.success(null);
  }

  async confirmRegistration(emailConfirmationCode: string): Promise<Result> {
    const user =
      await this.usersCommandRepository.findUserByEmailConfirmationCode(emailConfirmationCode);

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

    await this.usersCommandRepository.confirmEmail(user.email);

    return ResultFactory.success(null);
  }

  async refreshTokens(refreshToken: string): Promise<Result<JwtTokensPair>> {
    const tokenPayload = this.jwtService.decodeToken(refreshToken);
    const jwtTokensPair = await this.jwtService.createAccessAndRefreshTokens({
      deviceId: tokenPayload.deviceId,
      userId: tokenPayload.userId,
    });

    const { issuedDate, expirationDate } = this.jwtService.getTokenIatAndExpDate(
      jwtTokensPair.refreshToken,
    );

    await this.sessionsCommandRepository.updateSessionIatAndExpDate(
      tokenPayload.deviceId,
      issuedDate,
      expirationDate,
    );

    return ResultFactory.success(jwtTokensPair);
  }

  async logout(refreshToken: string): Promise<Result> {
    const tokenPayload = this.jwtService.decodeToken(refreshToken);
    await this.sessionsCommandRepository.deleteSessionByDeviceId(tokenPayload.deviceId);
    return ResultFactory.success(null);
  }

  async recoveryPassword(email: string) {
    const foundUser = await this.usersCommandRepository.findUserByLoginOrEmail(email);
    if (!foundUser) return ResultFactory.success(null);

    const recoveryCode = new RecoveryCode(foundUser.id);

    await this.recoveryCodesCommandRepository.save(recoveryCode);

    this.emailService
      .sendPasswordRecoveryCode(email, recoveryCode.code)
      .catch((error) => log('Send password recovery code error: ', error));

    return ResultFactory.success(null);
  }

  async updatePassword(recoveryCode: string, newPassword: string) {
    const foundRecoveryCode = await this.recoveryCodesCommandRepository.findCode(recoveryCode);

    if (!foundRecoveryCode) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'Invalid recovery code', [
        {
          field: 'recoveryCode',
          message: 'Invalid recovery code',
        },
      ]);
    }

    const newPasswordHash = await this.cryptoService.hashPassword(newPassword);

    await this.usersCommandRepository.updatePasswordHash(foundRecoveryCode.userId, newPasswordHash);

    return ResultFactory.success(null);
  }
}

export { AuthService };

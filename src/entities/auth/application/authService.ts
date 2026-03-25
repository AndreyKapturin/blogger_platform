import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { InputAuthData } from '../types';
import { CryptoService } from '../../../core/utils/crypto/passwordUtils';
import { JwtService } from '../../../core/utils/jwt/jwtUtils';
import { EmailService } from '../../../core/services/emailService';
import { log } from '../../../core/utils/logger/loggerUtils';
import { dateUtils } from '../../../core/utils/date/dateUtils';
import { JwtTokensPair } from '../types';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { SessionsCommandRepository } from '../repositories/sessionsCommandRepository';
import { RecoveryCodesCommandRepository } from '../repositories/RecoveryCodesCommandRepository';
import { inject, injectable } from 'inversify';
import { UserModel } from '../../users/domain/UserModel';
import { RecoveryCodeModel } from '../domain/RecoveryCodeModel';
import {
  EMAIL_CONFORMATION_CODE_LIFETIME_IN_MINUTES,
  PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS,
} from '../../../core/config';
import { SessionModel } from '../domain/SessionModel';
import { InputRegistrationDto } from '../domain/InputRegistrationDto';

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
  ) {}
  async login(inputAuthData: InputAuthData): Promise<Result<JwtTokensPair>> {
    const { credentials, requestDevice } = inputAuthData;
    const userDocument = await this.usersCommandRepository.findByLoginOrEmail(
      credentials.loginOrEmail,
    );

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'Invalid credentials', [
        {
          field: null,
          message: 'Invalid credentials',
        },
      ]);
    }

    const isValidPassword = await this.cryptoService.comparePassword(
      credentials.password,
      userDocument.passwordHash,
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
      userId: userDocument.id,
      deviceId,
    });

    const { issuedDate, expirationDate } = this.jwtService.getTokenIatAndExpDate(
      jwtTokensPair.refreshToken,
    );

    const newSessionDocument = new SessionModel({
      userId: userDocument.id,
      deviceId,
      issuedDate,
      deviceName: requestDevice.deviceName,
      ip: requestDevice.ip,
      expirationDate,
    });

    await this.sessionsCommandRepository.save(newSessionDocument);

    return ResultFactory.success(jwtTokensPair);
  }

  async registration(inputRegistrationDto: InputRegistrationDto): Promise<Result<string>> {
    let isUserExist = await this.usersCommandRepository.checkByEmail(inputRegistrationDto.email);

    if (isUserExist) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exists', [
        {
          field: 'email',
          message: 'User with passed email already exists',
        },
      ]);
    }

    isUserExist = await this.usersCommandRepository.checkByLogin(inputRegistrationDto.login);

    if (isUserExist) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exists', [
        {
          field: 'login',
          message: 'User with passed login already exists',
        },
      ]);
    }

    const passwordHash = await this.cryptoService.hashPassword(inputRegistrationDto.password);
    const emailConfirmationCode = crypto.randomUUID();

    const newUserDocument = new UserModel({
      login: inputRegistrationDto.login,
      email: inputRegistrationDto.email,
      emailConfirmation: {
        isConfirmed: false,
        code: emailConfirmationCode,
        codeExpirationDate: dateUtils.getDatePlusMinutes(
          EMAIL_CONFORMATION_CODE_LIFETIME_IN_MINUTES,
        ),
      },
      passwordHash,
      createdAt: new Date(),
    });

    const createdUserId = await this.usersCommandRepository.save(newUserDocument);

    this.emailService
      .sendConfirmationCode(newUserDocument.email, emailConfirmationCode)
      .catch((error) => log('Send confirmation code error: ', error));

    return ResultFactory.success(createdUserId);
  }

  async resendingConfirmationCode(email: string): Promise<Result> {
    const userDocument = await this.usersCommandRepository.findByLoginOrEmail(email);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User not found', [
        {
          field: 'email',
          message: 'User with passed email not exists',
        },
      ]);
    }

    if (userDocument.emailConfirmation.isConfirmed) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'Email is already confirmed', [
        {
          field: 'email',
          message: 'Email is already confirmed',
        },
      ]);
    }

    const newConfirmationCode = crypto.randomUUID();

    userDocument.emailConfirmation.code = newConfirmationCode;
    userDocument.emailConfirmation.codeExpirationDate = dateUtils.getDatePlusMinutes(
      EMAIL_CONFORMATION_CODE_LIFETIME_IN_MINUTES,
    );

    await this.usersCommandRepository.update(userDocument);

    this.emailService
      .sendConfirmationCode(userDocument.email, newConfirmationCode)
      .catch((error) => log('Send confirmation code error: ', error));

    return ResultFactory.success(null);
  }

  async confirmRegistration(emailConfirmationCode: string): Promise<Result> {
    const userDocument =
      await this.usersCommandRepository.findByEmailConfirmationCode(emailConfirmationCode);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User not found', [
        {
          field: 'code',
          message: 'User with passed confirmation code not exist',
        },
      ]);
    }

    if (userDocument.emailConfirmation.isConfirmed) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'Email is already confirmed', [
        {
          field: 'code',
          message: 'Email is already confirmed',
        },
      ]);
    }

    const isExpiredCode = dateUtils.dateIsExpired(
      userDocument.emailConfirmation.codeExpirationDate,
    );

    if (isExpiredCode) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'Confirmation code is expired', [
        {
          field: 'code',
          message: 'Confirmation code is expired',
        },
      ]);
    }

    userDocument.emailConfirmation.isConfirmed = true;

    await this.usersCommandRepository.update(userDocument);

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

    const sessionDocument = await this.sessionsCommandRepository.findSessionByDeviceId(
      tokenPayload.deviceId,
    );

    sessionDocument!.deviceId = tokenPayload.deviceId;
    sessionDocument!.issuedDate = issuedDate;
    sessionDocument!.expirationDate = expirationDate;

    await this.sessionsCommandRepository.update(sessionDocument!);

    return ResultFactory.success(jwtTokensPair);
  }

  async logout(refreshToken: string): Promise<Result> {
    const tokenPayload = this.jwtService.decodeToken(refreshToken);
    const sessionDocument = await this.sessionsCommandRepository.findSessionByDeviceId(
      tokenPayload.deviceId,
    );
    await this.sessionsCommandRepository.delete(sessionDocument!);
    return ResultFactory.success(null);
  }

  async recoveryPassword(email: string) {
    const userDocument = await this.usersCommandRepository.findByLoginOrEmail(email);
    if (!userDocument) return ResultFactory.success(null);

    const recoveryCode = new RecoveryCodeModel({
      code: crypto.randomUUID(),
      userId: userDocument.id,
      expirationDate: dateUtils.getDatePlusSeconds(PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS),
    });

    await this.recoveryCodesCommandRepository.save(recoveryCode);

    this.emailService
      .sendPasswordRecoveryCode(email, recoveryCode.code)
      .catch((error) => log('Send password recovery code error: ', error));

    return ResultFactory.success(null);
  }

  async updatePassword(recoveryCode: string, newPassword: string) {
    const recoveryCodeDocument = await this.recoveryCodesCommandRepository.findCode(recoveryCode);

    if (!recoveryCodeDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'Invalid recovery code', [
        {
          field: 'recoveryCode',
          message: 'Invalid recovery code',
        },
      ]);
    }

    const userDocument = await this.usersCommandRepository.findById(recoveryCodeDocument.userId);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User not found', [
        {
          field: 'recoveryCode',
          message: 'User with passed recovery code not exist',
        },
      ]);
    }

    const newPasswordHash = await this.cryptoService.hashPassword(newPassword);

    userDocument.passwordHash = newPasswordHash;

    await this.usersCommandRepository.update(userDocument);

    return ResultFactory.success(null);
  }
}

export { AuthService };

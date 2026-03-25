import { Request, Response } from 'express';
import { UsersQueryRepository } from '../../users/repositories/usersQueryRepository';
import { UserMeType } from '../../users/types';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { RequestWithBody } from '../../../core/types/RequestTypes';
import {
  AccessToken,
  EmailConfirmationCode,
  InputAuthData,
  InputEmailResendingType,
  InputLoginType,
  InputNewPassword,
  InputRecoveryPasswordType,
  InputRegistrationType,
} from '../types';
import { APIErrorResult } from '../../../core/types/APIErrorResult';
import { AuthService } from '../application/authService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { inject, injectable } from 'inversify';
import { InputRegistrationDto } from '../domain/InputRegistrationDto';

@injectable()
class AuthController {
  constructor(
    @inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository,
    @inject(AuthService)
    private authService: AuthService,
  ) {}
  async me(req: Request, res: Response<UserMeType>) {
    const foundUser = await this.usersQueryRepository.findMe(req.user!.userId);

    if (!foundUser) {
      res.sendStatus(HttpStatus.Not_Found);
      return;
    }
    res.status(HttpStatus.Ok).json(foundUser);
  }

  async login(req: RequestWithBody<InputLoginType>, res: Response<AccessToken | APIErrorResult>) {
    const inputAuthData: InputAuthData = {
      credentials: {
        loginOrEmail: req.body.loginOrEmail,
        password: req.body.password,
      },
      requestDevice: {
        ip: req.ip!,
        deviceName: `${req.useragent!.os} ${req.useragent!.browser}`,
      },
    };

    const loginResult = await this.authService.login(inputAuthData);

    if (isWrongResult(loginResult)) {
      sendHttpResponseIfWrongResult(loginResult, res);
      return;
    }

    res.cookie('refreshToken', loginResult.data.refreshToken, { httpOnly: true, secure: true });
    res.status(HttpStatus.Ok).json({ accessToken: loginResult.data.accessToken });
  }

  async registration(req: RequestWithBody<InputRegistrationType>, res: Response) {
    const inputRegistrationDto = new InputRegistrationDto(
      req.body.login,
      req.body.email,
      req.body.password,
    );
    const registrationResult = await this.authService.registration(inputRegistrationDto);

    if (isWrongResult(registrationResult)) {
      sendHttpResponseIfWrongResult(registrationResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async emailResending(
    req: RequestWithBody<InputEmailResendingType>,
    res: Response<APIErrorResult>,
  ) {
    const resendingConfirmationCodeResult = await this.authService.resendingConfirmationCode(
      req.body.email,
    );

    if (isWrongResult(resendingConfirmationCodeResult)) {
      sendHttpResponseIfWrongResult(resendingConfirmationCodeResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async registrationConfirmation(
    req: RequestWithBody<EmailConfirmationCode>,
    res: Response<APIErrorResult>,
  ) {
    const registrationConfirmationResult = await this.authService.confirmRegistration(
      req.body.code,
    );

    if (isWrongResult(registrationConfirmationResult)) {
      sendHttpResponseIfWrongResult(registrationConfirmationResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async refreshTokens(req: Request, res: Response<AccessToken | APIErrorResult>) {
    const updateTokensResult = await this.authService.refreshTokens(req.cookies.refreshToken);

    if (isWrongResult(updateTokensResult)) {
      sendHttpResponseIfWrongResult(updateTokensResult, res);
      return;
    }

    res.cookie('refreshToken', updateTokensResult.data.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(HttpStatus.Ok).json({ accessToken: updateTokensResult.data.accessToken });
  }

  async logout(req: Request, res: Response<APIErrorResult>) {
    const logoutResult = await this.authService.logout(req.cookies.refreshToken);

    if (isWrongResult(logoutResult)) {
      sendHttpResponseIfWrongResult(logoutResult, res);
      return;
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    res.sendStatus(HttpStatus.No_Content);
  }

  async recoveryPassword(
    req: RequestWithBody<InputRecoveryPasswordType>,
    res: Response<APIErrorResult>,
  ) {
    const recoveryPasswordResult = await this.authService.recoveryPassword(req.body.email);

    if (isWrongResult(recoveryPasswordResult)) {
      sendHttpResponseIfWrongResult(recoveryPasswordResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async newPassword(req: RequestWithBody<InputNewPassword>, res: Response<APIErrorResult>) {
    const updatePasswordResult = await this.authService.updatePassword(
      req.body.recoveryCode,
      req.body.newPassword,
    );

    if (isWrongResult(updatePasswordResult)) {
      sendHttpResponseIfWrongResult(updatePasswordResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }
}

export { AuthController };

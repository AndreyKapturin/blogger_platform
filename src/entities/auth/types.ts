import { JwtPayload } from 'jsonwebtoken';
import { InputUserType } from '../users/types';

type InputLoginType = {
  loginOrEmail: string;
  password: string;
};

type JwtTokenEncodePayload = {
  userId: string;
  deviceId: string;
};

type JwtTokenDecodePayload = JwtPayload &
  JwtTokenEncodePayload & {
    exp: number;
    iat: number;
  };

type JwtTokensPair = {
  accessToken: string;
  refreshToken: string;
};

type AccessToken = {
  accessToken: string;
};

type InputRegistrationType = InputUserType;

type InputEmailResendingType = {
  email: string;
};

type EmailConfirmationCode = {
  code: string;
};

type InputAuthData = {
  credentials: InputLoginType;
  requestDevice: RequestDevice;
};

type RequestDevice = {
  ip: string;
  deviceName: string;
};

type SecurityDevice = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

type SessionType = {
  userId: string;
  deviceId: string;
  issuedDate: Date;
  deviceName: string;
  ip: string;
  expirationDate: Date;
};

type InputRecoveryPasswordType = {
  email: string;
};

type InputNewPassword = {
  newPassword: string;
  recoveryCode: string;
};

type RecoveryCodeType = {
  code: string;
  expirationDate: Date;
  userId: string;
};

export type {
  InputRecoveryPasswordType,
  InputNewPassword,
  InputLoginType,
  AccessToken,
  InputRegistrationType,
  InputEmailResendingType,
  EmailConfirmationCode,
  JwtTokenEncodePayload,
  JwtTokenDecodePayload,
  JwtTokensPair,
  InputAuthData,
  RequestDevice,
  SecurityDevice,
  SessionType,
  RecoveryCodeType,
};

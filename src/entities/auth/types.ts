import { JwtPayload } from 'jsonwebtoken';
import { InputUserType } from '../users/types';

type InputLoginType = {
  loginOrEmail: string;
  password: string;
};

type JwtTokenPayload = JwtPayload & {
  userId: string;
}

type JwtTokensPair = {
  accessToken: string,
  refreshToken: string,
}

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

type RevokedRefreshToken = {
  token: string,
  expirationDate: Date,
}

type MongoRevokedRefreshToken = RevokedRefreshToken;

export type {
  RevokedRefreshToken,
  MongoRevokedRefreshToken,
  InputLoginType,
  AccessToken,
  InputRegistrationType,
  InputEmailResendingType,
  EmailConfirmationCode,
  JwtTokenPayload,
  JwtTokensPair,
};

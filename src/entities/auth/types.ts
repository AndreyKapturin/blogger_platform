import { InputUserType } from '../users/types';

type InputLoginType = {
  loginOrEmail: string;
  password: string;
};

type AccessToken = {
  accessToken: string;
};

type InputRegistrationType = InputUserType;

type InputEmailResendingType = {
  email: string;
};

export type { InputLoginType, AccessToken, InputRegistrationType, InputEmailResendingType };

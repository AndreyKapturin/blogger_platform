import { InputUserType } from "../users/types";

type InputLoginType = {
  loginOrEmail: string;
  password: string;
};

type AccessToken = {
  accessToken: string
}

type InputRegistrationType = InputUserType;

export type { InputLoginType, AccessToken, InputRegistrationType };

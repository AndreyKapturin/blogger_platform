import { decode, sign, verify } from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
} from '../../config';
import { JwtTokenDecodePayload, JwtTokenEncodePayload, JwtTokensPair } from '../../../entities/auth/types';

const createAccessToken = async (payload: JwtTokenEncodePayload) => {
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  });
};

const createRefreshToken = async (payload: JwtTokenEncodePayload) => {
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
  });
};

const createAccessAndRefreshTokens = async (payload: JwtTokenEncodePayload): Promise<JwtTokensPair> => {
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  return { accessToken, refreshToken };
};

const verifyToken = async (token: string) => verify(token, JWT_SECRET) as JwtTokenDecodePayload;

const decodeToken = (token: string) => decode(token) as JwtTokenDecodePayload;

const getTokenIatAndExpDate = (token: string) => {
  const { exp, iat  } = decodeToken(token);
  return {
    expirationDate: new Date(exp * 1000),
    issuedDate: new Date(iat * 1000),
  }
}

export {
  createAccessToken,
  createRefreshToken,
  createAccessAndRefreshTokens,
  verifyToken,
  decodeToken,
  getTokenIatAndExpDate,
};

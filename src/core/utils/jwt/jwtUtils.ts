import { decode, sign, verify } from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
} from '../../config';
import { JwtTokenPayload, JwtTokensPair } from '../../../entities/auth/types';

const createAccessToken = async (payload: JwtTokenPayload) => {
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  });
};

const createRefreshToken = async (payload: JwtTokenPayload) => {
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
  });
};

const createAccessAndRefreshTokens = async (payload: JwtTokenPayload): Promise<JwtTokensPair> => {
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  return { accessToken, refreshToken };
};

const verifyToken = async (token: string) => verify(token, JWT_SECRET) as JwtTokenPayload;

const decodeToken = (token: string) => decode(token) as JwtTokenPayload;

export {
  createAccessToken,
  createRefreshToken,
  createAccessAndRefreshTokens,
  verifyToken,
  decodeToken,
};

import { sign, verify } from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
} from '../../config';
import { JwtTokenPayload, JwtTokensPair } from '../../types/JwtTokens';

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

const verifyAccessToken = async (token: string) => verify(token, JWT_SECRET) as JwtTokenPayload;

export { createAccessToken, createRefreshToken, createAccessAndRefreshTokens, verifyAccessToken };

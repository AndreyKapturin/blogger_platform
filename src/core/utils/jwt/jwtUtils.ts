import { sign, verify } from 'jsonwebtoken';
import { JWT_SECRET, JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS } from '../../config';
import { AccessTokenPayload } from '../../types/JwtAccessTokenPayload';

const createAccessToken = async (payload: AccessTokenPayload) => {
  return sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS
    }
  )
}

const verifyAccessToken = async (token: string, ) => verify(token, JWT_SECRET);

export {
  createAccessToken,
  verifyAccessToken,
}
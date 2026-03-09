import { decode, sign, verify } from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
} from '../../config';
import {
  JwtTokenDecodePayload,
  JwtTokenEncodePayload,
  JwtTokensPair,
} from '../../../entities/auth/types';

class JwtService {
  async createAccessToken(payload: JwtTokenEncodePayload) {
    return sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
    });
  }

  async createRefreshToken(payload: JwtTokenEncodePayload) {
    return sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
    });
  }

  async createAccessAndRefreshTokens(payload: JwtTokenEncodePayload): Promise<JwtTokensPair> {
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  async verifyToken(token: string) {
    return verify(token, JWT_SECRET) as JwtTokenDecodePayload;
  }

  decodeToken(token: string) {
    return decode(token) as JwtTokenDecodePayload;
  }

  getTokenIatAndExpDate(token: string) {
    const { exp, iat } = this.decodeToken(token);
    return {
      expirationDate: new Date(exp * 1000),
      issuedDate: new Date(iat * 1000),
    };
  }
}

const jwtService = new JwtService();

export { jwtService, JwtService };

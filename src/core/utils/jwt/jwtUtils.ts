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
  static async createAccessToken(payload: JwtTokenEncodePayload) {
    return sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
    });
  }

  static async createRefreshToken(payload: JwtTokenEncodePayload) {
    return sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
    });
  }

  static async createAccessAndRefreshTokens(
    payload: JwtTokenEncodePayload,
  ): Promise<JwtTokensPair> {
    const accessToken = await JwtService.createAccessToken(payload);
    const refreshToken = await JwtService.createRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  static async verifyToken(token: string) {
    return verify(token, JWT_SECRET) as JwtTokenDecodePayload;
  }

  static decodeToken(token: string) {
    return decode(token) as JwtTokenDecodePayload;
  }

  static getTokenIatAndExpDate(token: string) {
    const { exp, iat } = JwtService.decodeToken(token);
    return {
      expirationDate: new Date(exp * 1000),
      issuedDate: new Date(iat * 1000),
    };
  }
}

const jwtService = JwtService;

export { jwtService };

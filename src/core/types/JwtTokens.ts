type JwtTokenPayload = {
  userId: string;
}

type JwtTokensPair = {
  accessToken: string,
  refreshToken: string,
}

export type { JwtTokenPayload, JwtTokensPair }
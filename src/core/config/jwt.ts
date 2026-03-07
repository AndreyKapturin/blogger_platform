export const JWT_SECRET = process.env.JWT_SECRET ?? 'hfdjkljh3upoi12u89jp0&T^^&*#$%&Q^';
export const JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS =
  Number(process.env.JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS) || 10;
export const JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS =
  Number(process.env.JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS) || 60;

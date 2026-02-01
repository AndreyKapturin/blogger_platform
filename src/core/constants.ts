export const ADMIN_LOGIN = 'admin';
export const ADMIN_PASSWORD = 'qwerty';
export const authHeader = `Basic ${Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}`).toString('base64')}`;
export const LoginStringRegExp = /^[a-zA-Z0-9_-]*$/;
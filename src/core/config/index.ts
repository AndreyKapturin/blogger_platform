import dotenv from 'dotenv';
dotenv.config();

export { MONGO_CONNECTION_URI } from './database';
export { MONGO_DB_NAME } from './database';

export { APP_PORT } from './server';

export {
  JWT_ACCESS_TOKEN_LIFETIME_IN_SECONDS,
  JWT_REFRESH_TOKEN_LIFETIME_IN_SECONDS,
  JWT_SECRET,
} from './jwt';

export {
  EMAIL_SERVICE_PASSWORD,
  EMAIL_SERVICE_USER_EMAIL,
  EMAIL_SERVICE_USER_LOGIN,
} from './email';

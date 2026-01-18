import dotenv from 'dotenv';

dotenv.config();

export const MONGO_DB_NAME = process.env.MONGO_DB_NAME ?? 'default_db_name';
export const MONGO_CONNECTION_URI = process.env.MONGO_CONNECTION_URI || 'mongodb://0.0.0.0:27017';
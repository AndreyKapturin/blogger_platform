import { MONGO_DB_NAME } from '../core/config';
import { log } from '../core/utils/logger/loggerUtils';
import mongoose, { Mongoose } from 'mongoose';

let mongooseClient: Mongoose;

async function connectToDB(mongoUri: string) {
  try {
    mongooseClient = await mongoose.connect(mongoUri, { dbName: MONGO_DB_NAME });
    log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    await mongooseClient.disconnect();
    throw new Error(`Database connection error: ${error}`);
  }
}

const closeBbConnection = async () => {
  await mongooseClient.disconnect();
};

export { connectToDB, closeBbConnection };

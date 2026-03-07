import { requestsCollection } from '../../../database/mongoDB';
import { RATE_LIMIT_WINDOW_IN_SECONDS } from '../constants';
import { RequestType } from '../types';

const save = async (request: RequestType) => {
  const { insertedId } = await requestsCollection.insertOne(request);
  return insertedId;
};

const getRequestsCount = async (ip: string, url: string) => {
  const targetDate = new Date;
  targetDate.setSeconds(targetDate.getSeconds() - RATE_LIMIT_WINDOW_IN_SECONDS);
  
  const documentCount = await requestsCollection.countDocuments(
    {
      ip,
      url,
      date: { $gte: targetDate }
    }
  )

  return documentCount;
}

const cleanAll = async () => {
  await requestsCollection.deleteMany();
};

const requestsCommandRepository = {
  save,
  getRequestsCount,
  cleanAll,
};

export { requestsCommandRepository };

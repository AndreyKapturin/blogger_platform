import { requestsCollection } from '../../../database/mongoDB';
import { RATE_LIMIT_WINDOW_IN_SECONDS } from '../constants';
import { RequestType } from '../types';

class RequestsCommandRepository {
  async save(request: RequestType) {
    const { insertedId } = await requestsCollection.insertOne(request);
    return insertedId;
  }

  async getRequestsCount(ip: string, url: string) {
    const targetDate = new Date();
    targetDate.setSeconds(targetDate.getSeconds() - RATE_LIMIT_WINDOW_IN_SECONDS);

    const documentCount = await requestsCollection.countDocuments({
      ip,
      url,
      date: { $gte: targetDate },
    });

    return documentCount;
  }

  async cleanAll() {
    await requestsCollection.deleteMany();
  }
}

export { RequestsCommandRepository };

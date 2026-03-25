import { injectable } from 'inversify';
import { RATE_LIMIT_WINDOW_IN_SECONDS } from '../constants';
import { RequestDocumentType, RequestModel } from '../domain/RequestModel';

@injectable()
class RequestsCommandRepository {
  async save(newRequestDocument: RequestDocumentType): Promise<string> {
    const savedRequestDocument = await newRequestDocument.save();
    return savedRequestDocument.id;
  }

  async getRequestsCount(ip: string, url: string): Promise<number> {
    const targetDate = new Date();
    targetDate.setSeconds(targetDate.getSeconds() - RATE_LIMIT_WINDOW_IN_SECONDS);

    const documentCount = await RequestModel.countDocuments({
      ip,
      url,
      date: { $gte: targetDate },
    });

    return documentCount;
  }

  async cleanAll(): Promise<void> {
    await RequestModel.deleteMany();
  }
}

export { RequestsCommandRepository };

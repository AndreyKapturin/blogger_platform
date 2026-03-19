import { injectable } from 'inversify';
import { SessionDocumentType, SessionModel } from '../domain/SessionModel';

@injectable()
class SessionsCommandRepository {
  async save(sessionDocument: SessionDocumentType): Promise<void> {
    await sessionDocument.save();
  }

  async existsDeviceSession(deviceId: string, issuedDate: Date) {
    const documentsCount = await SessionModel.countDocuments(
      {
        $and: [{ deviceId }, { issuedDate }],
      },
      { limit: 1 },
    );
    return Boolean(documentsCount);
  }

  async delete(sessionDocument: SessionDocumentType): Promise<boolean> {
    const { deletedCount } = await sessionDocument.deleteOne();
    return Boolean(deletedCount);
  }

  async update(sessionDocument: SessionDocumentType): Promise<boolean> {
    await sessionDocument.save();
    return true;
  }

  async terminateOtherSession(userId: string, deviceId: string): Promise<void> {
    await SessionModel.deleteMany({
      $and: [{ userId }, { deviceId: { $ne: deviceId } }],
    });
  }

  async findSessionByDeviceId(deviceId: string): Promise<SessionDocumentType | null> {
    return await SessionModel.findOne({ deviceId });
  }

  async cleanAll(): Promise<void> {
    await SessionModel.deleteMany();
  }
}

export { SessionsCommandRepository };

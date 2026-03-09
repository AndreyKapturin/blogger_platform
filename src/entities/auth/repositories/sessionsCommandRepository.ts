import { WithId } from 'mongodb';
import { sessionsCollection } from '../../../database/mongoDB';
import { Session } from '../types';

class SessionsCommandRepository {
  async save(session: Session) {
    sessionsCollection.insertOne(session);
  }

  async existsDeviceSession(deviceId: string, issuedDate: Date) {
    const documentsCount = await sessionsCollection.countDocuments(
      {
        $and: [{ deviceId }, { issuedDate }],
      },
      { limit: 1 },
    );
    return Boolean(documentsCount);
  }

  async deleteSessionByDeviceId(deviceId: string) {
    const { deletedCount } = await sessionsCollection.deleteOne({ deviceId });
    return Boolean(deletedCount);
  }

  async updateSessionIatAndExpDate(deviceId: string, issuedDate: Date, expirationDate: Date) {
    const { matchedCount } = await sessionsCollection.updateOne(
      { deviceId },
      { $set: { issuedDate, expirationDate } },
    );
    return Boolean(matchedCount);
  }

  async terminateOtherSession(userId: string, deviceId: string) {
    await sessionsCollection.deleteMany({
      $and: [{ userId }, { deviceId: { $ne: deviceId } }],
    });
  }

  async findSessionByDeviceId(deviceId: string) {
    const foundSession = await sessionsCollection.findOne({ deviceId });
    return foundSession ? this._cleanObjectIdMapper(foundSession) : null;
  }

  private _cleanObjectIdMapper(mongoSession: WithId<Session>): Session {
    return {
      deviceId: mongoSession.deviceId,
      deviceName: mongoSession.deviceName,
      expirationDate: mongoSession.expirationDate,
      ip: mongoSession.ip,
      issuedDate: mongoSession.issuedDate,
      userId: mongoSession.userId,
    };
  }

  async cleanAll() {
    sessionsCollection.deleteMany();
  }
}
const sessionsCommandRepository = new SessionsCommandRepository();

export { sessionsCommandRepository, SessionsCommandRepository };

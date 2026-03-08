import { WithId } from 'mongodb';
import { sessionsCollection } from '../../../database/mongoDB';
import { Session } from '../types';

class SessionsCommandRepository {
  static async save(session: Session) {
    sessionsCollection.insertOne(session);
  }

  static async existsDeviceSession(deviceId: string, issuedDate: Date) {
    const documentsCount = await sessionsCollection.countDocuments(
      {
        $and: [{ deviceId }, { issuedDate }],
      },
      { limit: 1 },
    );
    return Boolean(documentsCount);
  }

  static async deleteSessionByDeviceId(deviceId: string) {
    const { deletedCount } = await sessionsCollection.deleteOne({ deviceId });
    return Boolean(deletedCount);
  }

  static async updateSessionIatAndExpDate(
    deviceId: string,
    issuedDate: Date,
    expirationDate: Date,
  ) {
    const { matchedCount } = await sessionsCollection.updateOne(
      { deviceId },
      { $set: { issuedDate, expirationDate } },
    );
    return Boolean(matchedCount);
  }

  static async terminateOtherSession(userId: string, deviceId: string) {
    await sessionsCollection.deleteMany({
      $and: [{ userId }, { deviceId: { $ne: deviceId } }],
    });
  }

  static async findSessionByDeviceId(deviceId: string) {
    const foundSession = await sessionsCollection.findOne({ deviceId });
    return foundSession ? SessionsCommandRepository._cleanObjectIdMapper(foundSession) : null;
  }

  static _cleanObjectIdMapper(mongoSession: WithId<Session>): Session {
    return {
      deviceId: mongoSession.deviceId,
      deviceName: mongoSession.deviceName,
      expirationDate: mongoSession.expirationDate,
      ip: mongoSession.ip,
      issuedDate: mongoSession.issuedDate,
      userId: mongoSession.userId,
    };
  }

  static async cleanAll() {
    sessionsCollection.deleteMany();
  }
}
const sessionsCommandRepository = SessionsCommandRepository;

export { sessionsCommandRepository };

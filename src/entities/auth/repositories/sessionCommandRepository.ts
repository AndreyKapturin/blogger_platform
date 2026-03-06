import { WithId } from 'mongodb';
import { sessionCollection } from '../../../database/mongoDB';
import { Session } from '../types';

const save = async (session: Session) => sessionCollection.insertOne(session);

const existsDeviceSession = async (deviceId: string, issuedDate: Date) => {
  const documentsCount = await sessionCollection.countDocuments(
    {
      $and: [{ deviceId }, { issuedDate }],
    },
    { limit: 1 },
  );
  return Boolean(documentsCount);
};

const deleteSessionByDeviceId = async (deviceId: string) => {
  const { deletedCount } = await sessionCollection.deleteOne({ deviceId });
  return Boolean(deletedCount);
};

const updateSessionIatAndExpDate = async (
  deviceId: string,
  issuedDate: Date,
  expirationDate: Date,
) => {
  const { matchedCount } = await sessionCollection.updateOne(
    { deviceId },
    { $set: { issuedDate, expirationDate } },
  );
  return Boolean(matchedCount);
};

const terminateOtherSession = async (userId: string, deviceId: string) => {
  await sessionCollection.deleteMany({
    $and: [{ userId }, { deviceId: { $ne: deviceId } }],
  });
};

const findSessionByDeviceId = async (deviceId: string) => {
  const foundSession = await sessionCollection.findOne({ deviceId });
  return foundSession ? _cleanObjectIdMapper(foundSession) : null;
};

const _cleanObjectIdMapper = (mongoSession: WithId<Session>): Session => {
  return {
    deviceId: mongoSession.deviceId,
    deviceName: mongoSession.deviceName,
    expirationDate: mongoSession.expirationDate,
    ip: mongoSession.ip,
    issuedDate: mongoSession.issuedDate,
    userId: mongoSession.userId,
  }
}

const cleanAll = async () => sessionCollection.deleteMany();

const sessionCommandRepository = {
  save,
  existsDeviceSession,
  deleteSessionByDeviceId,
  updateSessionIatAndExpDate,
  terminateOtherSession,
  findSessionByDeviceId,
  cleanAll,
};

export { sessionCommandRepository };

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

const cleanAll = async () => sessionCollection.deleteMany();

const sessionCommandRepository = {
  save,
  existsDeviceSession,
  deleteSessionByDeviceId,
  updateSessionIatAndExpDate,
  cleanAll,
};

export { sessionCommandRepository };

import { sessionCollection } from '../../../database/mongoDB';

const terminateOtherSession = async (userId: string, deviceId: string) => {
  await sessionCollection.deleteMany({
    $and: [{ userId }, { deviceId: { $ne: deviceId } }],
  });
};

const devicesRepository = {
  terminateOtherSession,
};

export { devicesRepository };

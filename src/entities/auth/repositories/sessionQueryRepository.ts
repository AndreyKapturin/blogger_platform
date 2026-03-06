import { WithId } from 'mongodb';
import { sessionCollection } from '../../../database/mongoDB';
import { Session } from '../types';
import { ViewSecurityDeviceType } from '../../security/types';

const getAllDevicesForUser = async (userId: string) => {
  return sessionCollection
    .find({ $and: [{ userId }, { expirationDate: { $gt: new Date } }] })
    .map(_sessionToDeviceMapper)
    .toArray();
};

const _sessionToDeviceMapper = (session: WithId<Session>): ViewSecurityDeviceType => {
  return {
    deviceId: session.deviceId,
    ip: session.ip,
    lastActiveDate: session.issuedDate.toISOString(),
    title: session.deviceName,
  };
};

const sessionQueryRepository = {
  getAllDevicesForUser,
};

export { sessionQueryRepository };

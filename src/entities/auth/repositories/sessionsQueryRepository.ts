import { WithId } from 'mongodb';
import { sessionsCollection } from '../../../database/mongoDB';
import { Session } from '../types';
import { ViewSecurityDeviceType } from '../../security/types';

class SessionsQueryRepository {
  static async getAllDevicesForUser(userId: string) {
    return sessionsCollection
      .find({ $and: [{ userId }, { expirationDate: { $gt: new Date() } }] })
      .map(SessionsQueryRepository._sessionToDeviceMapper)
      .toArray();
  }

  static _sessionToDeviceMapper = (session: WithId<Session>): ViewSecurityDeviceType => {
    return {
      deviceId: session.deviceId,
      ip: session.ip,
      lastActiveDate: session.issuedDate.toISOString(),
      title: session.deviceName,
    };
  };
}

const sessionsQueryRepository = SessionsQueryRepository;

export { sessionsQueryRepository };

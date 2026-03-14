import { WithId } from 'mongodb';
import { sessionsCollection } from '../../../database/mongoDB';
import { Session } from '../types';
import { ViewSecurityDeviceType } from '../../security/types';
import { injectable } from 'inversify';

@injectable()
class SessionsQueryRepository {
  async getAllDevicesForUser(userId: string) {
    return sessionsCollection
      .find({ $and: [{ userId }, { expirationDate: { $gt: new Date() } }] })
      .map(this._sessionToDeviceMapper)
      .toArray();
  }

  private _sessionToDeviceMapper = (session: WithId<Session>): ViewSecurityDeviceType => {
    return {
      deviceId: session.deviceId,
      ip: session.ip,
      lastActiveDate: session.issuedDate.toISOString(),
      title: session.deviceName,
    };
  };
}

export { SessionsQueryRepository };

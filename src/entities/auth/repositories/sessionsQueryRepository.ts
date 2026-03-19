import { ViewSecurityDeviceType } from '../../security/types';
import { injectable } from 'inversify';
import { SessionLeanDocument, SessionModel } from '../domain/SessionModel';

@injectable()
class SessionsQueryRepository {
  async getAllDevicesForUser(userId: string) {
    const sessionLeanDocuments: SessionLeanDocument[] = await SessionModel.find({
      $and: [{ userId }, { expirationDate: { $gt: new Date() } }],
    }).lean();
    const viewDevices = sessionLeanDocuments.map(this._sessionToDeviceMapper);
    return viewDevices;
  }

  private _sessionToDeviceMapper = (
    sessionLeanDocument: SessionLeanDocument,
  ): ViewSecurityDeviceType => {
    return {
      deviceId: sessionLeanDocument.deviceId,
      ip: sessionLeanDocument.ip,
      lastActiveDate: sessionLeanDocument.issuedDate.toISOString(),
      title: sessionLeanDocument.deviceName,
    };
  };
}

export { SessionsQueryRepository };

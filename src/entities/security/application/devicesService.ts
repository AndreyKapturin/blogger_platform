import { jwtService } from '../../../core/utils/jwt/jwtUtils';
import { ResultFactory, ResultStatus } from '../../../core/utils/Result';
import { sessionsCommandRepository } from '../../auth/repositories/sessionsCommandRepository';

class DevicesService {
  static async terminateOtherDevices(refreshToken: string) {
    const tokenPayload = jwtService.decodeToken(refreshToken);
    await sessionsCommandRepository.terminateOtherSession(
      tokenPayload.userId,
      tokenPayload.deviceId,
    );
    return ResultFactory.success(null);
  }

  static async terminateDeviceById(deviceId: string, refreshToken: string) {
    const foundSession = await sessionsCommandRepository.findSessionByDeviceId(deviceId);

    if (!foundSession) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Device not found', [
        {
          field: 'deviceId',
          message: `Device with id ${deviceId} not found`,
        },
      ]);
    }

    const tokenPayload = jwtService.decodeToken(refreshToken);

    if (foundSession.userId !== tokenPayload.userId) {
      return ResultFactory.wrong(ResultStatus.PermissionError, 'Deleting not own device', [
        {
          field: 'deviceId',
          message: 'You are not owner of device',
        },
      ]);
    }

    await sessionsCommandRepository.deleteSessionByDeviceId(deviceId);

    return ResultFactory.success(null);
  }
}

const devicesService = DevicesService;

export { devicesService };

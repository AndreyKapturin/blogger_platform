import { JwtService } from '../../../core/utils/jwt/jwtUtils';
import { ResultFactory, ResultStatus } from '../../../core/utils/Result';
import { SessionsCommandRepository } from '../../auth/repositories/sessionsCommandRepository';

class DevicesService {
  constructor(
    private jwtService: JwtService,
    private sessionsCommandRepository: SessionsCommandRepository,
  ) {}

  async terminateOtherDevices(refreshToken: string) {
    const tokenPayload = this.jwtService.decodeToken(refreshToken);
    await this.sessionsCommandRepository.terminateOtherSession(
      tokenPayload.userId,
      tokenPayload.deviceId,
    );
    return ResultFactory.success(null);
  }

  async terminateDeviceById(deviceId: string, refreshToken: string) {
    const foundSession = await this.sessionsCommandRepository.findSessionByDeviceId(deviceId);

    if (!foundSession) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Device not found', [
        {
          field: 'deviceId',
          message: `Device with id ${deviceId} not found`,
        },
      ]);
    }

    const tokenPayload = this.jwtService.decodeToken(refreshToken);

    if (foundSession.userId !== tokenPayload.userId) {
      return ResultFactory.wrong(ResultStatus.PermissionError, 'Deleting not own device', [
        {
          field: 'deviceId',
          message: 'You are not owner of device',
        },
      ]);
    }

    await this.sessionsCommandRepository.deleteSessionByDeviceId(deviceId);

    return ResultFactory.success(null);
  }
}

export { DevicesService };

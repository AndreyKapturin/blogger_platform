import { decodeToken } from '../../../core/utils/jwt/jwtUtils';
import { ResultFactory, ResultStatus } from '../../../core/utils/Result';
import { sessionCommandRepository } from '../../auth/repositories/sessionCommandRepository';

const terminateOtherDevices = async (refreshToken: string) => {
  const tokenPayload = decodeToken(refreshToken);
  await sessionCommandRepository.terminateOtherSession(tokenPayload.userId, tokenPayload.deviceId);
  return ResultFactory.success(null);
};

const terminateDeviceById = async (deviceId: string, refreshToken: string) => {
  const foundSession = await sessionCommandRepository.findSessionByDeviceId(deviceId);

  if (!foundSession) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'Device not found', [
      {
        field: 'deviceId',
        message: `Device with id ${deviceId} not found`,
      },
    ]);
  }

  const tokenPayload = decodeToken(refreshToken);

  if (foundSession.userId !== tokenPayload.userId) {
    return ResultFactory.wrong(ResultStatus.PermissionError, 'Deleting not own device', [
      {
        field: 'deviceId',
        message: 'You are not owner of device'
      }
    ])
  }

  await sessionCommandRepository.deleteSessionByDeviceId(deviceId);

  return ResultFactory.success(null);
};

const devicesService = {
  terminateOtherDevices,
  terminateDeviceById,
};

export { devicesService };

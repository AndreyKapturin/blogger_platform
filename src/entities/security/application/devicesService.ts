import { decodeToken } from '../../../core/utils/jwt/jwtUtils';
import { ResultFactory } from '../../../core/utils/Result';
import { devicesRepository } from '../repositories/devicesRepository';

const terminateOtherDevices = async (refreshToken: string) => {
  const tokenPayload = decodeToken(refreshToken);
  await devicesRepository.terminateOtherSession(tokenPayload.userId, tokenPayload.deviceId);
  return ResultFactory.success(null);
};

const devicesService = {
  terminateOtherDevices,
};

export { devicesService };

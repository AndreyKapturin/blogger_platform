import { Router } from 'express';
import { Routes } from '../../../app/routes';
import { refreshTokenMiddleware } from '../../../core/middlewares/refreshTokenMiddleware';
import { getSecurityDevices } from './handlers/getSecurityDevices';
import { terminateOtherDevices } from './handlers/terminateOtherDevices';
import { terminateDevice } from './handlers/terminateDevice';

const securityRouter = Router();

securityRouter.get(Routes.Devices, refreshTokenMiddleware, getSecurityDevices);

securityRouter.delete(Routes.Devices, refreshTokenMiddleware, terminateOtherDevices);

securityRouter.delete(Routes.DeviceById(':id'), refreshTokenMiddleware, terminateDevice);

export { securityRouter };

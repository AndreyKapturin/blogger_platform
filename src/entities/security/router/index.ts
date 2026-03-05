import { Router } from 'express';
import { Routes } from '../../../app/routes';
import { refreshTokenMiddleware } from '../../../core/middlewares/refreshTokenMiddleware';
import { getSecurityDevices } from './handlers/getSecurityDevices';
import { terminateOtherDevices } from './handlers/terminateOtherDevices';

const securityRouter = Router();

securityRouter.get(Routes.Devices, refreshTokenMiddleware, getSecurityDevices);
securityRouter.delete(Routes.Devices, refreshTokenMiddleware, terminateOtherDevices);

export { securityRouter };

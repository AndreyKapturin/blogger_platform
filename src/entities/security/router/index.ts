import { Router } from 'express';
import { Routes } from '../../../app/routes';
import { refreshTokenMiddleware } from '../../../core/middlewares/refreshTokenMiddleware';
import { getSecurityDevices } from './handlers/getSecurityDevices';

const securityRouter = Router();

securityRouter.get(Routes.Devices, refreshTokenMiddleware, getSecurityDevices);

export { securityRouter };

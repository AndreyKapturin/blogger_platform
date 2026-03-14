import { Router } from 'express';
import { Routes } from '../../../app/routes';
import { refreshTokenMiddleware } from '../../../core/middlewares/refreshTokenMiddleware';
import { container } from '../../../compositionRoot';
import { SecurityController } from '../controller/SecurityController';

const securityController = container.get(SecurityController);

const securityRouter = Router();

securityRouter.get(
  Routes.Devices,
  refreshTokenMiddleware,
  securityController.getSecurityDevices.bind(securityController),
);

securityRouter.delete(
  Routes.Devices,
  refreshTokenMiddleware,
  securityController.terminateOtherDevices.bind(securityController),
);

securityRouter.delete(
  Routes.DeviceById(':id'),
  refreshTokenMiddleware,
  securityController.terminateDevice.bind(securityController),
);

export { securityRouter };

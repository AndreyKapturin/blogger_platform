import { Router } from 'express';
import { HttpStatus } from '../../core/types/HttpStatus';
import { cleanDatabase } from './service/testingService';
import { Routes } from '../../app/routes';

const testingRouter = Router();
testingRouter.delete(Routes.AllData, async (req, res) => {
  await cleanDatabase();
  res.sendStatus(HttpStatus.No_Content);
});

export { testingRouter };

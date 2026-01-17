import { Router } from 'express';
import { HttpStatus } from '../../core/types/HttpStatus';
import { cleanDatabase } from './service/testingService';

const testingRouter = Router();
testingRouter.delete('/all-data', async (req, res) => {
  await cleanDatabase();
  res.sendStatus(HttpStatus.No_Content);
});

export { testingRouter };

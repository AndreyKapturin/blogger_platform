import { param } from 'express-validator';

const idInParamsCheckMiddleware = param('id')
  .exists()
    .withMessage('Id is required')
  .isMongoId()
    .withMessage('Id has incorrect format');

export { idInParamsCheckMiddleware };

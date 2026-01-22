import { checkSchema } from 'express-validator';

const paginatorValidationSchema = checkSchema(
  {
    pageNumber: {
      default: { options: 1 },
      isInt: true,
      toInt: true,
    },
    pageSize: {
      default: { options: 10 },
      isInt: true,
      toInt: true,
    },
  },
  ['query'],
);

export { paginatorValidationSchema };

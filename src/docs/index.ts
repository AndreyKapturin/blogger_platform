import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bloggers platform',
      version: '1.0.0',
      description: 'A platform for publishing posts from various blogs',
    },
  },
  apis: ['./src/**/*.swagger.yml'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
const docsRouter = Router();
docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export { docsRouter }
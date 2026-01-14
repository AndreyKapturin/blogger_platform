import express from 'express';
import { Routes } from './routes';
import { blogsRouter } from '../entities/blogs/router';
import { jsonBodyMiddleware } from './middlewares/jsonBodyMiddleware';
import { testingRouter } from '../entities/testing/router';

const createApp = () => {
  const app = express();
  app.use(jsonBodyMiddleware);
  app.use(Routes.Blogs, blogsRouter);
  app.use(Routes.Testing, testingRouter);
  return app;
};

export { createApp };

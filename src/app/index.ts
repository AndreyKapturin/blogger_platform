import express from 'express';
import { Routes } from './routes';
import { blogsRouter } from '../entities/blogs/router';
import { jsonBodyMiddleware } from '../core/middlewares/jsonBodyMiddleware';
import { testingRouter } from '../entities/testing/router';
import { postsRouter } from '../entities/posts/router';
import { docsRouter } from '../docs';

const createApp = () => {
  const app = express();
  app.use(jsonBodyMiddleware);
  app.use(Routes.Blogs, blogsRouter);
  app.use(Routes.Testing, testingRouter);
  app.use(Routes.Posts, postsRouter);
  app.use(Routes.Docs, docsRouter);
  return app;
};

export { createApp };

import express, { Express, Request, Response } from 'express';
import { Routes } from './routes';
import { blogsRouter } from '../entities/blogs/router';
import { jsonBodyMiddleware } from '../core/middlewares/jsonBodyMiddleware';
import { testingRouter } from '../entities/testing/router';
import { postsRouter } from '../entities/posts/router';
import { docsRouter } from '../core/docs';
import { connectToDB } from '../database/mongoDB';
import { errorsHandler } from '../core/errors/errorsHandler';
import { usersRouter } from '../entities/users/router';
import { authRouter } from '../entities/auth/router';
import { commentsRouter } from '../entities/comments/router';
import { MONGO_CONNECTION_URI } from '../core/config';

const createApp = async (): Promise<Express> => {
  await connectToDB(MONGO_CONNECTION_URI);
  const app = express();
  app.use(jsonBodyMiddleware);
  app.use(Routes.Auth, authRouter);
  app.use(Routes.Blogs, blogsRouter);
  app.use(Routes.Comments, commentsRouter);
  app.use(Routes.Posts, postsRouter);
  app.use(Routes.Users, usersRouter);
  app.use(Routes.Testing, testingRouter);
  app.use(Routes.Docs, docsRouter);
  app.use(errorsHandler);
  return app;
};

export { createApp };

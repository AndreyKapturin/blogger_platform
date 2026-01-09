import express from 'express';

const createApp = () => {
  const app = express();

  app.get('/', (req, res) => {
    res.send('Hello world');
  });

  return app;
};

export { createApp };

import { createApp } from './app';
import { APP_PORT } from './core/config/server';

(async () => {
  const app = await createApp();
  app.listen(APP_PORT, () => console.log(`Server has been start on ${APP_PORT} port`));
})();

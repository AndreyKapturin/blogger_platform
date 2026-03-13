import { createApp } from './app';
import { APP_PORT } from './core/config/server';
import { log } from './core/utils/logger/loggerUtils';
import './compositionRoot';

(async () => {
  const app = await createApp();
  app.listen(APP_PORT, () => log(`Server has been start on ${APP_PORT} port`));
})();

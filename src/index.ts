import { createApp } from './app';
const app = createApp();
const port = process.env.PORT ?? 5001;
app.listen(port, () => console.log(`Server has been start on ${port} port`));

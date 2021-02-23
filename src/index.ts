import { json } from 'body-parser';
import express from 'express';

import { stockRouter } from './routes';

const app = express();
app.use(json());
app.use(stockRouter);

app.listen(3000, () => {
  console.log('listening');
});

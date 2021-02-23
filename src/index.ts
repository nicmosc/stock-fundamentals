import { json } from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';

import { stockRouter } from './routes';

const app = express();
app.use(json());
app.use(stockRouter);

mongoose.connect(
  'mongodb://localhost:27017/stock-fundamentals',
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log('connected af');
  },
);

app.listen(3000, () => {
  console.log('listening');
});

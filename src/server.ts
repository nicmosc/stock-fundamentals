import { json } from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import { stockRouter } from './routes';
import { connectToServer } from './utils';

dotenv.config();

const app = express();
app.use(json());
app.use(stockRouter);

connectToServer();

app.listen(3000, () => {
  console.log('listening');
});

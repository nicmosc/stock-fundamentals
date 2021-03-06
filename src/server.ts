// import path from 'path';

import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// import { backup } from './backup';
import { jobsScheduler } from './jobs-scheduler';
import { stockRouter, symbolRouter } from './routes';
import { connectToServer } from './utils';

dotenv.config();

const app = express();

app.use(json());
app.use(cors());
app.use(stockRouter);
app.use(symbolRouter);
app.use(express.static('/dump/stock-fundamentals/'));

const port = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === 'production';

app.listen(port, () => {
  connectToServer();

  console.log(`Server Started in ${process.env.NODE_ENV} mode on port ${port}`);

  if (isProduction) {
    // Startup backup + scheduled tasks
    // backup();
    jobsScheduler();
  }
});

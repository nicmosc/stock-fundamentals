import express, { Response } from 'express';

import { Symbol } from '../models';

const router = express.Router();

router.get('/api/symbols', async (_, res: Response) => {
  const symbols = await Symbol.find();
  return res.status(200).send(symbols);
});

export { router as symbolRouter };

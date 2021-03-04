import express, { Response } from 'express';

import { Stock } from '../models';

const router = express.Router();

router.get('/api/stocks', async (_, res: Response) => {
  const stocks = await Stock.find();
  return res.status(200).send(stocks);
});

// Here for reference
// router.post('/api/stock', async (req: Request, res: Response) => {
//   const { ticker, companyName } = req.body;

//   const stock = Stock.make({ ticker, companyName });
//   await stock.save();
//   return res.status(201).send(stock);
// });

export { router as stockRouter };

import express, { Response } from 'express';

const router = express.Router();

router.get('/api/stock', (_, res: Response) => {
  return res.send('stock');
});

router.get('/api/stocks', (_, res: Response) => {
  return res.send('all stocks');
});

export { router as stockRouter };

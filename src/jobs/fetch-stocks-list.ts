import { Stock } from '~/models';
import { TwelveData } from '~/types';
import { connectToServer, disconnectFromServer } from '~/utils';

export const exchanges = ['NYSE', 'NASDAQ', 'XLON', 'EURONEXT', 'TSX', 'XETR', 'OMX', 'XASX'];

export async function fetchStocksList(): Promise<Array<TwelveData> | undefined> {
  // get from api
  const stocks = [
    { symbol: 'AGFS', name: 'Example 1' },
    { symbol: 'DBDR', name: 'Example 2' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'LOGI', name: 'Logitech' },
    { symbol: 'ETSY', name: 'Etsy' },
    { symbol: 'ECOWVE', name: 'Example 3' },
    { symbol: 'SFTR', name: 'Example 4' },
  ];

  await connectToServer();

  try {
    const existingStocks = await Stock.find();
    const existingSymbols = existingStocks.map((stock) => stock.symbol);
    const newStocks = stocks
      .map((stock) => ({ symbol: stock.symbol, name: stock.name }))
      .filter((stock) => !existingSymbols.includes(stock.symbol));

    console.log('new stocks', newStocks);
    const res = await Stock.insertMany(newStocks);

    console.log('Saved stocks list');

    disconnectFromServer();

    return res;
  } catch (error) {
    console.error(error);
  }
}

fetchStocksList();

import { Symbol } from '~/models';
import { TwelveData } from '~/types';
import { connectToServer, disconnectFromServer } from '~/utils';

export const exchanges = ['NYSE', 'NASDAQ', 'XLON', 'EURONEXT', 'TSX', 'XETR', 'OMX', 'XASX'];

export async function fetchSymbolsList(): Promise<Array<TwelveData> | undefined> {
  // get from api
  const symbols = [
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
    const existingStocks = await Symbol.find();
    const existingSymbols = existingStocks.map((stock) => stock.symbol);
    const newStocks = symbols
      .map((symbol) => ({ symbol: symbol.symbol, name: symbol.name }))
      .filter((symbol) => !existingSymbols.includes(symbol.symbol));

    console.log('new symbols', newStocks);
    const res = await Symbol.insertMany(newStocks);

    console.log('Saved symbols list');

    disconnectFromServer();

    return res;
  } catch (error) {
    console.error(error);
  }
}

fetchSymbolsList();

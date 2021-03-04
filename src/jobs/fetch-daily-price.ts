import { chunk } from 'lodash';
import urlJoin from 'url-join';

import { Stock } from '~/models';
import { connectToServer, disconnectFromServer, getRequest, timeout } from '~/utils';

const API_URL = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo';
const API_HOST = 'yahoo-finance15.p.rapidapi.com';
const REQUEST_DELAY = (60 / 100) * 1000;

const API_PATH = 'qu/quote';

async function getPriceForSymbols(
  symbols: Array<string>,
): Promise<Array<{ symbol: string; regularMarketPrice: number }>> {
  try {
    return await getRequest(urlJoin(API_URL, API_PATH, symbols.join(',')), API_HOST);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Get daily price for multiple stocks (up to 50)
export async function fetchDailyPrice() {
  await connectToServer();

  const stocks = await Stock.find();
  const chunks = chunk(stocks, 50);

  console.log('Fetching daily prices...');

  for (const chunk of chunks) {
    const timeStart = Date.now();

    const prices = await getPriceForSymbols(chunk.map((c) => c.symbol));

    const timeEnd = Date.now();
    const timeRemaining = REQUEST_DELAY - (timeEnd - timeStart);
    if (timeRemaining > 0) {
      await timeout(timeRemaining); // Required by Yahoo API limits
    }

    await Stock.bulkWrite(
      prices.map((symbol) => ({
        updateOne: {
          filter: { symbol: symbol.symbol },
          update: { $set: { 'stats.currentPrice': symbol.regularMarketPrice } },
        },
      })),
    );
  }

  console.log('Finished updated stock prices');

  disconnectFromServer();
}

// fetchDailyPrice();

import { uniqBy } from 'lodash';

import { Symbol } from '~/models';
import { EXCHANGES, Symbol as SymbolType, TwelveData } from '~/types';
import { connectToServer, disconnectFromServer, getRequest, timeout } from '~/utils';

const exchangeToSymbolMod: Record<typeof EXCHANGES[number], (arg: string) => string> = {
  XLON: (symbol: string) => `${symbol}.L`,
  XAMS: (symbol: string) => `${symbol}.AS`,
  XBRU: (symbol: string) => `${symbol}.BR`,
  XLIS: (symbol: string) => `${symbol}.LS`,
  XOSL: (symbol: string) => `${symbol}.OL`,
  XPAR: (symbol: string) => `${symbol}.PA`,
  TSX: (symbol: string) => `${symbol}.TO`,
  XETR: (symbol: string) => `${symbol}.MU`,
  OMX: (symbol: string) => `${symbol}.ST`,
  XASX: (symbol: string) => `${symbol}.AX`,
};

const API_URL = 'https://twelve-data1.p.rapidapi.com/stocks';
const API_HOST = 'twelve-data1.p.rapidapi.com';
const REQUEST_DELAY = (60 / 12) * 1000;

async function getFromExchange(exchange: string): Promise<Array<SymbolType>> {
  try {
    const { data }: { data: Array<SymbolType> } = await getRequest(API_URL, API_HOST, {
      exchange,
      format: 'json',
    });
    return data.map((d) => ({ ...d, exchange }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function getAllSymbols(): Promise<Array<SymbolType>> {
  let allSymbols: Array<SymbolType> = [];

  for (const exchange of EXCHANGES) {
    const timeStart = Date.now();

    console.log(`Fetching symbols from ${exchange} exchange`);
    const symbols = await getFromExchange(exchange);

    const timeEnd = Date.now();
    const timeRemaining = REQUEST_DELAY - (timeEnd - timeStart);
    if (timeRemaining > 0) {
      await timeout(timeRemaining); // Required by TwelveData API limits
    }

    if (symbols.length > 0) {
      console.log(symbols[0]);
      allSymbols.push(...symbols);
    }
  }

  return uniqBy(uniqBy(allSymbols, 'symbol'), 'name');
}

export async function fetchSymbolsList(): Promise<Array<TwelveData> | undefined> {
  // get from api
  const symbols = await getAllSymbols();

  await connectToServer();

  try {
    const existingStocks = await Symbol.find();
    const existingSymbols = existingStocks.map((stock) => stock.symbol);
    const newStocks: Array<SymbolType> = symbols
      .map((symbol) => ({
        name: symbol.name,
        symbol:
          exchangeToSymbolMod[symbol.exchange] != null
            ? exchangeToSymbolMod[symbol.exchange](symbol.symbol)
            : symbol.symbol,
        rawSymbol: exchangeToSymbolMod[symbol.exchange] != null ? symbol.symbol : undefined,
        currency: symbol.currency,
        exchange: symbol.exchange,
      }))
      .filter((symbol) => !existingSymbols.includes(symbol.symbol));

    const res = await Symbol.insertMany(newStocks);

    console.log('Saved symbols list');

    disconnectFromServer();

    return res;
  } catch (error) {
    console.error(error);
  }
}

fetchSymbolsList();

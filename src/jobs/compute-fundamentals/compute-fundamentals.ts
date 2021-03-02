import urlJoin from 'url-join';

import { Stock, Symbol } from '~/models';
import {
  BalanceSheet,
  CashflowStatement,
  Earnings,
  EarningsTrend,
  FinancialData,
  KeyStats,
  Profile,
  YahooData,
} from '~/types';
import { connectToServer, disconnectFromServer, getRequest, timeout } from '~/utils';

import { computeStock } from './compute-stock';
import { coarseFilter, fineFilter } from './filters';

const API_URL = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo';
const API_HOST = 'yahoo-finance15.p.rapidapi.com';

const ONE_MONTH = 1000 * 60 * 60 * 48 * 28;

const enum ApiPath {
  QUOTE = 'qu/quote',
  MODULE = 'mo/module',
}

const enum DataPoints {
  PROFILE = 'asset-profile',
  KEY_STATS = 'default-key-statistics',
  EARNINGS = 'earnings',
  BALANCE_SHEET = 'balance-sheet',
  EARNINGS_TREND = 'earnings-trend',
  FINANCIAL_DATA = 'financial-data',
  CASHFLOW_STATEMENT = 'cashflow-statement',
}

function isOneMonthAgo(date: Date) {
  return new Date().getTime() - ONE_MONTH >= date.getTime();
}

async function getBasicInfo(stock: string) {
  const req = await getRequest(urlJoin(API_URL, ApiPath.MODULE, stock), API_HOST, {
    module: [DataPoints.PROFILE, DataPoints.KEY_STATS].join(','),
  });
  return req;
}

async function getFundamentals(stock: string) {
  const req = await getRequest(urlJoin(API_URL, ApiPath.MODULE, stock), API_HOST, {
    module: [
      DataPoints.EARNINGS,
      DataPoints.BALANCE_SHEET,
      DataPoints.EARNINGS_TREND,
      DataPoints.FINANCIAL_DATA,
      DataPoints.CASHFLOW_STATEMENT,
    ].join(','),
  });
  return req;
}

async function getYahooRawData(symbol: string): Promise<YahooData | false | undefined> {
  try {
    const info: {
      assetProfile: Profile;
      defaultKeyStatistics: KeyStats;
    } = await getBasicInfo(symbol);

    const fundamentals: {
      balanceSheetHistory: { balanceSheetStatements: BalanceSheet };
      earningsTrend: { trend: EarningsTrend };
      earnings: Earnings;
      cashflowStatementHistory: { cashflowStatements: CashflowStatement };
      financialData: FinancialData;
    } = await getFundamentals(symbol);

    const yahooRawData: YahooData = {
      profile: info.assetProfile,
      keyStats: info.defaultKeyStatistics,
      balanceSheet: fundamentals.balanceSheetHistory?.balanceSheetStatements,
      earningsTrend: fundamentals.earningsTrend?.trend,
      earnings: fundamentals.earnings,
      cashflowStatement: fundamentals.cashflowStatementHistory?.cashflowStatements,
      financialData: fundamentals.financialData,
    };
    return yahooRawData;
  } catch (err) {
    console.error('error', err);
    return false;
  }
}

export async function computeFundamentals() {
  await connectToServer();

  const symbols = await Symbol.find();
  if (symbols == null) return;

  for (const symbol of symbols) {
    if (symbol.ignored === true || (symbol.updatedAt != null && !isOneMonthAgo(symbol.updatedAt))) {
      // Skip any ignored stocks i.e. for which we have no data, or that were already computed
      console.log(`Skipping ${symbol.symbol} because ignored, or already updated`);
      continue;
    } else {
      // Get new data and save it
      console.log(`Computing data for ${symbol.symbol}`);
      const timeStart = Date.now();
      const rawData = await getYahooRawData(symbol.symbol);
      const timeEnd = Date.now();
      const timeUntil1000 = 1000 - (timeEnd - timeStart);
      if (timeUntil1000 > 0) {
        await timeout(timeUntil1000); // Required by Yahoo API limits
      }

      if (rawData === false) {
        // if something went wrong, skip it
        continue;
      }

      const hasEnoughData = rawData != null ? coarseFilter(rawData) : false;

      if (!hasEnoughData) {
        const stock = await Stock.findOne({ symbol: symbol.symbol });
        if (stock == null) {
          await Symbol.findByIdAndUpdate(symbol, { ignored: true, updatedAt: new Date() });
        }
        continue;
      }

      const stockWithStats = computeStock(symbol, rawData!);
      const hasGoodFundamentals = fineFilter(stockWithStats);

      if (hasGoodFundamentals) {
        // Save it or create if it doesnt exist
        const stock = await Stock.findOne({ symbol: stockWithStats.symbol });
        if (stock != null) {
          await Stock.findByIdAndUpdate(stock, stockWithStats);
        } else {
          try {
            await Stock.create(stockWithStats);
          } catch (error) {
            console.error(
              `Invalid data. Could not save stock ${stockWithStats.symbol} (${stockWithStats.name})`,
            );
          }
        }
      } else {
        // If fundamentals are bad, delete if exists
        console.log(`Removing ${symbol.symbol}, fundamentals have worsened`);
        await Stock.findOneAndDelete({ symbol: stockWithStats.symbol });
      }
      await Symbol.findByIdAndUpdate(symbol, { updatedAt: new Date() });
    }
  }

  disconnectFromServer();
}

computeFundamentals();

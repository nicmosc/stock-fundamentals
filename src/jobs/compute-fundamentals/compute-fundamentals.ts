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

async function getYahooRawData(symbol: string): Promise<YahooData | undefined> {
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
    } = await getFundamentals('AAPL');

    const yahooRawData: YahooData = {
      profile: info.assetProfile,
      keyStats: info.defaultKeyStatistics,
      balanceSheet: fundamentals.balanceSheetHistory.balanceSheetStatements,
      earningsTrend: fundamentals.earningsTrend.trend,
      earnings: fundamentals.earnings,
      cashflowStatement: fundamentals.cashflowStatementHistory.cashflowStatements,
      financialData: fundamentals.financialData,
    };
    return yahooRawData;
  } catch (err) {
    console.error('error', err);
  }
}

/**
 * Elements taken into account here:
 * - Cash-flow to debt ratio
 * - Free cash flow + below
 * - Free cash flow (%)
 * - ROIC
 * - D/E
 */

export async function computeFundamentals() {
  await connectToServer();

  const symbols = await Symbol.find();
  if (symbols == null) return;

  for (const symbol of symbols) {
    if (symbol.ignored === true) {
      // Skip any ignored stocks i.e. for which we have no data
      continue;
    } else {
      // Get new data and save it
      const timeStart = Date.now();
      const rawData = await getYahooRawData(symbol.symbol);
      const timeEnd = Date.now();
      const timeUntil1000 = 1000 - (timeEnd - timeStart);
      if (timeUntil1000 > 0) {
        await timeout(timeUntil1000); // Required by Yahoo API limits
      }

      const hasEnoughData = rawData != null ? coarseFilter(rawData) : false;

      if (!hasEnoughData) {
        await Symbol.findByIdAndUpdate(symbol, { ignored: true });
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
        // await Stock.findByIdAndDelete(stockWithStats);
      }
    }
  }

  disconnectFromServer();
}

computeFundamentals();

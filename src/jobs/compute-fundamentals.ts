import urlJoin from 'url-join';

import {
  BalanceSheet,
  CashflowStatement,
  Earnings,
  EarningsTrend,
  IncomeStatement,
  KeyStats,
  Profile,
  Yahoo,
} from '~/types';
import { getRequest } from '~/utils';

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
  INCOME_STATEMENT = 'income-statement',
  BALANCE_SHEET = 'balance-sheet',
  EARNINGS_TREND = 'earnings-trend',
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
      DataPoints.INCOME_STATEMENT,
      DataPoints.BALANCE_SHEET,
      DataPoints.EARNINGS_TREND,
      DataPoints.CASHFLOW_STATEMENT,
    ].join(','),
  });
  return req;
}

async function getYahooRawData(): Promise<Yahoo | undefined> {
  try {
    const info: {
      assetProfile: Profile;
      defaultKeyStatistics: KeyStats;
    } = await getBasicInfo('AAPL');

    const fundamentals: {
      incomeincomeStatementHistory: IncomeStatement;
      balanceSheetHistory: BalanceSheet;
      earningsTrend: EarningsTrend;
      earnings: Earnings;
      cashflowStatementHistory: CashflowStatement;
    } = await getFundamentals('AAPL');

    const yahooRawData: Yahoo = {
      profile: info.assetProfile,
      keyStats: info.defaultKeyStatistics,
      incomeStatement: fundamentals.incomeincomeStatementHistory,
      balanceSheet: fundamentals.balanceSheetHistory,
      earningsTrend: fundamentals.earningsTrend,
      earnings: fundamentals.earnings,
      cashflowStatement: fundamentals.cashflowStatementHistory,
    };
    return yahooRawData;
  } catch (err) {
    console.error('error', err);
  }
}

export function computeFundamentals() {}

computeFundamentals();

export interface Figure {
  raw: number;
}

export interface Profile {
  country: string;
  industry: string;
  sector: string;
}

export interface KeyStats {
  forwardPE?: Figure;
  profitMargins?: Figure;
  trailingEps?: Figure;
  forwardEps?: Figure;
}

export type BalanceSheet = Array<{
  totalStockholderEquity?: Figure;
  cash?: Figure;
  longTermDebt?: Figure;
}>;

export type EarningsTrend = Array<{
  period?: string; // We need the +5y
  growth?: Figure;
}>;

export interface Earnings {
  financialsChart: {
    yearly: Array<{
      date: string; // 2018
      revenue: Figure;
      earnings: Figure;
    }>;
  };
  financialCurrency: string; // Currency code
}

export type CashflowStatement = Array<{
  netIncome?: Figure;
  depreciation?: Figure;
  dividendsPaid?: Figure;
  totalCashFromOperatingActivities?: Figure;
  capitalExpenditures?: Figure;
}>;

export type FinancialData = {
  revenueGrowth?: Figure;
  freeCashFlow?: Figure;
  currentPrice: Figure;
};

export interface YahooData {
  profile: Profile;
  keyStats?: KeyStats;
  balanceSheet?: BalanceSheet;
  earningsTrend?: EarningsTrend;
  earnings?: Earnings;
  cashflowStatement?: CashflowStatement;
  financialData?: FinancialData;
}

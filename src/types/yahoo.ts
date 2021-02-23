export interface Figure {
  raw: number;
}

export interface Profile {
  country: string;
  industry: string;
  sector: string;
}

export interface KeyStats {
  forwardPE: Figure;
  profitMargins: Figure;
  trailingEps: Figure;
  forwardEps: Figure;
}

export interface IncomeStatement {
  incomeStatementHistory: Array<{
    netIncome: Figure;
    netIncomeApplicableToCommonShares: Figure;
  }>;
}

export interface BalanceSheet {
  balanceSheetStatements: Array<{
    totalStockholderEquity: Figure;
    cash: Figure;
    longTermDebt: Figure;
  }>;
}

export interface EarningsTrend {
  trend: Array<{
    period: string; // We need the +5y
    growth: Figure;
  }>;
}

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

export interface CashflowStatement {
  cashflowStatements: Array<{
    netIncome: Figure;
    depreciation: Figure;
    dividendsPaid: Figure;
  }>;
}

export interface Yahoo {
  profile: Profile;
  keyStats: KeyStats;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  earningsTrend: EarningsTrend;
  earnings: Earnings;
  cashflowStatement: CashflowStatement;
}

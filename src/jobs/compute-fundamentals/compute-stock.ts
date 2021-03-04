import {
  BalanceSheet,
  CashflowStatement,
  EarningsTrend,
  PartialYahooData,
  Stock,
  Symbol,
} from '../../types';

function computeFCF(cfs: CashflowStatement[0]): number | undefined {
  if (cfs.totalCashFromOperatingActivities == null || cfs.capitalExpenditures == null) {
    return;
  }
  return cfs.totalCashFromOperatingActivities.raw - cfs.capitalExpenditures.raw;
}

function computeTotalCapitalization(bss: BalanceSheet[0]): number | undefined {
  if (bss.longTermDebt == null || bss.totalStockholderEquity == null) {
    return;
  }
  return bss.longTermDebt.raw + bss.totalStockholderEquity.raw;
}

function computeDebtToEquity(bss: BalanceSheet[0]): number | undefined {
  if (bss.longTermDebt == null || bss.totalStockholderEquity == null) {
    return;
  }
  return bss.longTermDebt.raw / bss.totalStockholderEquity.raw;
}

function getEstimatedGrowthRate(earnings: EarningsTrend): number | undefined {
  const fiveYearEstimate = earnings.find((earning) => earning.period === '+5y');
  if (fiveYearEstimate != null) {
    return fiveYearEstimate.growth?.raw;
  }
}

function computeEstimatedGrowthRate(
  cfs: CashflowStatement[0],
  totalCapitalization: number,
): number | undefined {
  if (cfs.dividendsPaid == null || cfs.depreciation == null) {
    return;
  }
  return (cfs.netIncome!.raw + cfs.dividendsPaid.raw + cfs.depreciation.raw) / totalCapitalization;
}

function getGrowthRate(computed: number | undefined, estimated: number | undefined): number {
  if (computed == null && estimated == null) {
    return 0;
  }
  if (computed != null && estimated != null) {
    return Math.min(computed, estimated);
  }
  return estimated ?? computed ?? 0;
}

export function computeStock(symbol: Symbol, data: PartialYahooData): Omit<Stock, 'profile'> {
  const FCF = data.financialData?.freeCashFlow?.raw ?? computeFCF(data.cashflowStatement![0]);
  const totalCapitalization = computeTotalCapitalization(data.balanceSheet![0]);
  const FCFYield =
    FCF == null || totalCapitalization == null ? undefined : FCF / totalCapitalization;

  const debtToEquity = computeDebtToEquity(data.balanceSheet![0]);

  const netIncome = data.cashflowStatement![0].netIncome!;
  const ROIC = totalCapitalization == null ? undefined : netIncome.raw / totalCapitalization;

  const profitMargin = data.keyStats!.profitMargins!.raw;
  const EPS =
    data.keyStats!.forwardEps == null
      ? data.keyStats!.trailingEps!.raw
      : (data.keyStats!.forwardEps!.raw + data.keyStats!.trailingEps!.raw) / 2;

  const computedGrowthRate =
    totalCapitalization == null
      ? undefined
      : computeEstimatedGrowthRate(data.cashflowStatement![0], totalCapitalization);
  const estimatedGrowthRate = getEstimatedGrowthRate(data.earningsTrend!);
  const growthRate = getGrowthRate(computedGrowthRate, estimatedGrowthRate);

  const forwardPE = data.keyStats?.forwardPE;
  const PE =
    forwardPE == null ? growthRate * 2 * 100 : Math.min(growthRate * 2 * 100, forwardPE.raw);

  const est10YearEPS = [...Array(9)].reduce((memo) => memo + memo * growthRate, EPS);
  const est10thYearPrice = est10YearEPS * PE;

  return {
    symbol: symbol.symbol,
    name: symbol.name,
    stats: {
      revenueGrowth: data.financialData!.revenueGrowth!.raw,
      PE,
      growthRate,
      profitMargin,
      EPS,
      FCFYield,
      debtToEquity,
      ROIC,
      est10YearEPS,
      est10thYearPrice,
      currentPrice: data.financialData!.currentPrice.raw,
    },
  };
}

import { BalanceSheet, CashflowStatement, EarningsTrend, Stock, Symbol, YahooData } from '~/types';

function computeFCF(cfs: CashflowStatement[0]): number | undefined {
  if (cfs.totalCashFromOperatingActivities == null || cfs.capitalExpenditures == null) {
    return;
  }
  return cfs.totalCashFromOperatingActivities.raw - cfs.capitalExpenditures.raw;
}

function computeTotalCapitalization(bss: BalanceSheet[0]): number {
  return bss.longTermDebt!.raw + bss.totalStockholderEquity!.raw;
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
): number {
  return (
    (cfs.netIncome!.raw + cfs.dividendsPaid!.raw + cfs.depreciation!.raw) / totalCapitalization
  );
}

export function computeStock(symbol: Symbol, data: YahooData): Stock {
  const FCF = data.financialData?.freeCashFlow?.raw ?? computeFCF(data.cashflowStatement![0]);
  const totalCapitalization = computeTotalCapitalization(data.balanceSheet![0]);
  const FCFYield = FCF == null ? undefined : FCF / totalCapitalization;

  const debtToEquity = computeDebtToEquity(data.balanceSheet![0]);

  const netIncome = data.cashflowStatement![0].netIncome!;
  const ROIC = netIncome.raw / totalCapitalization;

  const profitMargin = data.keyStats!.profitMargins!.raw;
  const EPS = (data.keyStats!.forwardEps!.raw + data.keyStats!.trailingEps!.raw) / 2;

  const computedGrowthRate = computeEstimatedGrowthRate(
    data.cashflowStatement![0],
    totalCapitalization,
  );
  const estimatedGrowthRate = getEstimatedGrowthRate(data.earningsTrend!);
  const growthRate =
    estimatedGrowthRate == null
      ? computedGrowthRate
      : Math.min(estimatedGrowthRate, computedGrowthRate);

  const forwardPE = data.keyStats?.forwardPE;
  const PE = forwardPE == null ? growthRate * 2 : Math.min(growthRate * 2, forwardPE.raw);

  const est10YearEPS = [...Array(10)].reduce((memo) => memo * growthRate, EPS);
  const est10thYearPrice = est10YearEPS * PE;

  return {
    symbol: symbol.symbol,
    name: symbol.name,
    profile: data.profile,
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
    },
  };
}

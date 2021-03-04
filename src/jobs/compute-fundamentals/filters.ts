import { PartialYahooData, Stock } from '../../types';

export function coarseFilter(stockData: PartialYahooData): boolean {
  const { cashflowStatement, balanceSheet, financialData, earningsTrend, keyStats } = stockData;
  let hasEnoughData = true;

  hasEnoughData =
    hasEnoughData &&
    cashflowStatement != null &&
    cashflowStatement.length > 0 &&
    cashflowStatement.some((s) => s.netIncome != null);

  hasEnoughData = hasEnoughData && balanceSheet != null && balanceSheet.length > 0;

  hasEnoughData = hasEnoughData && earningsTrend != null && earningsTrend.length > 0;

  hasEnoughData =
    hasEnoughData &&
    financialData != null &&
    financialData.revenueGrowth != null &&
    financialData.currentPrice != null;

  hasEnoughData =
    hasEnoughData &&
    keyStats != null &&
    keyStats.trailingEps != null &&
    keyStats.profitMargins != null;

  return hasEnoughData;
}

/**
 * Elements taken into account here:
 * - Free cash flow (%)
 *     -> FCF = cashFlowStatements[0].totalCashFromOperatingActivities - cashFlowStatements[0].capitalExpenditures
 *     -> Total Capitalization = balanceSheetStatements[0].longTermDebt + balanceSheetStatements[0].totalStockHolderEquity
 *     -> FCF ratio = FCF / Total Capitalization
 * - Profit margins > 0 and Revenue growth growing since 2,3 years
 * - D/E < 0.5
 *      -> balanceSheetStatements[0].longTermDebt / balanceSheetStatements[0].totalStockHolderEquity
 * - ROIC > 10%
 *      -> Net income / Invested Cap (LT Debt + shareholder equity)
 *       = incomeStatements[0].netIncome / Total Capitalization (see above)
 * - Share price > $3
 */

export function fineFilter(stock: Omit<Stock, 'profile'>): boolean {
  let hasHealthyStats = true;

  hasHealthyStats = hasHealthyStats && stock.stats.growthRate > 0;
  hasHealthyStats = hasHealthyStats && stock.stats.profitMargin > 0;
  hasHealthyStats = hasHealthyStats && stock.stats.currentPrice > 5; // TODO handle other than USD
  hasHealthyStats = hasHealthyStats && stock.stats.revenueGrowth > 0.1;

  return hasHealthyStats;
}

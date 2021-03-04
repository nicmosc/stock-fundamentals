import mongoose, { Document, Schema } from 'mongoose';

import { Stock as StockType } from '../types';

interface StockDocument extends Document, StockType {}

const stockSchema: Schema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  profile: {
    country: String,
    industry: String,
    sector: String,
  },
  stats: {
    revenueGrowth: Number,
    profitMargin: Number,
    EPS: Number,
    growthRate: Number,
    PE: Number,
    debtToEquity: Number,
    FCFYield: Number,
    ROIC: Number,
    est10YearEPS: Number,
    est10thYearPrice: Number,
    currentPrice: Number,
  },
});

export const Stock = mongoose.model<StockDocument>('Stock', stockSchema);

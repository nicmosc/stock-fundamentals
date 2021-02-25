import mongoose, { Document, Model } from 'mongoose';

import { Stock as StockType } from '../types';

interface StockDocument extends Document, StockType {}

interface StockModelInterface extends Model<StockDocument> {
  make(attr: StockType): StockDocument;
}

const stockSchema = new mongoose.Schema({
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
  },
});

export const Stock = mongoose.model<any, StockModelInterface>('Stock', stockSchema);

stockSchema.statics.make = (attr: StockType) => {
  return new Stock(attr);
};

import mongoose, { Document, Schema } from 'mongoose';

import { Symbol as SymbolType } from '../types';

interface SymbolDocument extends Document, SymbolType {}

const symbolSchema: Schema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  exchange: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  rawSymbol: String,
  ignored: Boolean,
  updatedAt: Date,
});

export const Symbol = mongoose.model<SymbolDocument>('Symbol', symbolSchema);

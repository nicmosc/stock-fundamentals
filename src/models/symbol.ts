import mongoose, { Document, Model } from 'mongoose';

import { Symbol as SymbolType } from '../types';

interface SymbolDocument extends Document, SymbolType {}

interface SymbolModelInterface extends Model<SymbolDocument> {
  make(attr: SymbolType): SymbolDocument;
}

const symbolSchema = new mongoose.Schema({
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

export const Symbol = mongoose.model<any, SymbolModelInterface>('Symbol', symbolSchema);

symbolSchema.statics.make = (attr: SymbolType) => {
  return new Symbol(attr);
};

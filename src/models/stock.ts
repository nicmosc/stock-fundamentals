import mongoose, { Document, Model } from 'mongoose';

interface StockType {
  symbol: string;
  name: string;
  ignored?: boolean;
}

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
  ignored: {
    type: Boolean,
    required: false,
  },
});

export const Stock = mongoose.model<any, StockModelInterface>('Stock', stockSchema);

stockSchema.statics.make = (attr: StockType) => {
  return new Stock(attr);
};

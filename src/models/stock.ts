import mongoose, { Document, Model } from 'mongoose';

interface StockType {
  ticker: string;
  companyName?: string;
}

interface StockDocument extends Document, StockType {}

interface StockModelInterface extends Model<StockDocument> {
  make(attr: StockType): StockDocument;
}

const stockSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: false,
  },
});

export const Stock = mongoose.model<any, StockModelInterface>('Stock', stockSchema);

stockSchema.statics.make = (attr: StockType) => {
  return new Stock(attr);
};

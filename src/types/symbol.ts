export const EXCHANGES = [
  'NYSE',
  'NASDAQ',
  'XLON',
  'XAMS',
  'XBRU',
  'XLIS',
  'XOSL',
  'XPAR',
  'TSX',
  'XETR',
  'OMX',
  'XASX',
];

export interface Symbol {
  symbol: string;
  name: string;
  ignored?: boolean; // These are stocks for which we can't get data
  updatedAt?: Date;
  exchange: typeof EXCHANGES[number];
  rawSymbol?: string;
  currency: string;
}

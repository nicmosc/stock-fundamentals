export interface Symbol {
  symbol: string;
  name: string;
  ignored?: boolean; // These are stocks for which we can't get data
}

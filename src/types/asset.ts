export default interface Asset {
  symbol: string;
  name: string;
  price: number;
  dividend_yield: string;
  expense_ratio?: string;
}

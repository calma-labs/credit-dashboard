//standarized metric's type
export type StandarizedMetric = {
  symbol: string;
  mintAddress: string;
  tvl: number;
  utilization: number;
  supplyAPY: number;
  borrowRate: number;
  lending: string;
};

//compared metrics
export type ComparedMetric = {
  mintAddress: string;
  tvl: number | string;
  utilization: number | string;
  supplyAPY: number | string;
  borrowRate: number | string;
};

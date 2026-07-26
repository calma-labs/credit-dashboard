//standarized metric's type
export type StandarizedMetric = {
  symbol: string,
  mintAddress: string,
  tvl: number,
  utilization: number,
  supplyAPY: number,
  borrowRate: number,
  borrowAPY: number,
  lending: string,
  chain: string,
  market: string,
  collateral?: string,
  ltv?: number,
  lltv?: number,
  liqThreshold?: number,
  protocolTotalActiveLoans?: number | null,
}

//compared metrics
export type ComparedMetric = {
  mintAddress: string,
  tvl: number | string,
  utilization: number | string,
  supplyAPY: number | string,
  borrowRate: number | string,
}

export type GraphQLError = {
  message: string;
}

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
}
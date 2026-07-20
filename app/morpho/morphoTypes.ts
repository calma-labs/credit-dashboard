import { type GraphQLResponse, type GraphQLError } from '@/app/globalComponents/globalTypes';

export type TimeseriesPoint = {
  x: number;
  y: number;
}

export type MorphoMarketState = {
  supplyAssetsUsd: number;
}

export type MorphoMarketDetailState = {
  supplyAssetsUsd: number | null;
  borrowAssetsUsd: number | null;
  utilization: number | null;
  supplyApy: number | null;
  borrowApy: number | null;
}

export type MorphoMarketSummary = {
  marketId: string;
  chain: { id: number };
  loanAsset: { symbol: string };
  collateralAsset: { symbol: string } | null;
  lltv: string | null;
  state: MorphoMarketState;
}

export type MorphoMarketDetail = {
  state: MorphoMarketDetailState | null;
  historicalState: {
    supplyApy: TimeseriesPoint[];
  };
}

export type MorphoMarketsResponse = GraphQLResponse<{ markets?: { items: MorphoMarketSummary[] } }>;
export type MorphoHistoryResponse = GraphQLResponse<{ marketById?: MorphoMarketDetail | null }>;

export type MorphoDebugResult = {
  httpStatus: number;
  errors: GraphQLError[] | null;
  itemCount: number;
  sample: MorphoMarketSummary[];
}

export type MorphoHistoryPoint = {
  date: string;
  apy: number;
  utilization: null;
}

export type MorphoSnapshot = {
  tvl: number | null;
  supplyAPY: number | null;
  borrowRate: number | null;
  utilization: number | null;
}

export type MorphoHistoryResult = {
  history: MorphoHistoryPoint[];
  poolId: string | null;
  source: string | null;
  matchedSymbol?: string;
  snapshot: MorphoSnapshot | null;
}
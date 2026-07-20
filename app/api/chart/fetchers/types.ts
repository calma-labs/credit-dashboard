import { type StandarizedMetric } from '../../../globalComponents/globalTypes';

export interface TokenHistoryPoint {
    date: string;
    apy: number;
    utilization: number | null;
}

export interface TokenSnapshot {
    tvl: number;
    supplyAPY: number;
    borrowRate: number;
    utilization: number;
    protocolTotalActiveLoans?: number | null;
}

export interface TokenDataResult {
    poolId: string | null;
    source: string | null;
    matchedSymbol: string;
    snapshot: TokenSnapshot | null;
    history: TokenHistoryPoint[];
}

export interface ITokenFetcher {
    fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null>;
    fetchMetrics(): Promise<StandarizedMetric[]>;
}

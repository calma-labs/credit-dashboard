import { ITokenFetcher, TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';

export abstract class BaseTokenFetcher implements ITokenFetcher {
    abstract fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult>;
    abstract fetchMetrics(): Promise<StandarizedMetric[]>;

    protected handleError(
        error: unknown,
        platform: string,
        asset: string,
        source: string | null = null,
        poolId: string | null = null
    ): TokenDataResult {
        console.error(`[${platform} Fetcher] Error fetching data for ${asset}:`, error);
        return this.getEmptyResult(asset, source, poolId);
    }

    protected getEmptyResult(asset: string, source: string | null = null, poolId: string | null = null): TokenDataResult {
        return {
            history: [],
            poolId,
            source,
            matchedSymbol: asset,
            snapshot: null,
        };
    }
}

import { ITokenFetcher, TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';

export abstract class BaseTokenFetcher implements ITokenFetcher {
    abstract fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null>;
    abstract fetchMetrics(): Promise<StandarizedMetric[]>;

    protected handleError(
        error: unknown,
        platform: string,
        asset: string,
        source: string | null = null,
        poolId: string | null = null
    ): null {
        console.error(`[${platform} Fetcher] Error fetching data for ${asset}:`, error);
        return null;
    }
}

import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { kaminoStandarizedTokens } from '../../../kaminolend/kamino_lend';
import { DefiLlamaFetcher } from './DefiLlamaFetcher';

export class KaminoFetcher extends BaseTokenFetcher {
    private fallbackFetcher = new DefiLlamaFetcher();

    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await kaminoStandarizedTokens();
        } catch (err) {
            console.error('[KaminoFetcher] Error fetching metrics:', err);
            return [];
        }
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult> {
        return this.fallbackFetcher.fetch(platform, asset, collateral);
    }
}

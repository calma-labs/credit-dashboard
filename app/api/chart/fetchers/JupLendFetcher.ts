import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { standarizedJupLendToken } from '../../../juplend/hooks/useJupLendData';
import { DefiLlamaFetcher } from './DefiLlamaFetcher';

export class JupLendFetcher extends BaseTokenFetcher {
    private fallbackFetcher = new DefiLlamaFetcher();

    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await standarizedJupLendToken();
        } catch (err) {
            console.error('[JupLendFetcher] Error fetching metrics:', err);
            return [];
        }
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult> {
        return this.fallbackFetcher.fetch(platform, asset, collateral);
    }
}

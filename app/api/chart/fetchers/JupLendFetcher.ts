import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { standarizedJupLendToken } from '../../../juplend/hooks/useJupLendData';

export class JupLendFetcher extends BaseTokenFetcher {

    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await standarizedJupLendToken();
        } catch (err) {
            console.error('[JupLendFetcher] Error fetching metrics:', err);
            return [];
        }
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null> {
        throw new Error('JupLend has no native history API');
    }
}

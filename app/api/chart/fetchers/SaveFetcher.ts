import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { fetchSaveData } from '../../../save/saveData';
import { DefiLlamaFetcher } from './DefiLlamaFetcher';

export class SaveFetcher extends BaseTokenFetcher {
    private fallbackFetcher = new DefiLlamaFetcher();

    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await fetchSaveData();
        } catch (err) {
            console.error('[SaveFetcher] Error fetching metrics:', err);
            return [];
        }
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult> {
        return this.fallbackFetcher.fetch(platform, asset, collateral);
    }
}

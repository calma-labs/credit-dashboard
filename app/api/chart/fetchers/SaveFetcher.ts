import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult, TokenHistoryPoint, TokenSnapshot } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { symbolMatches, fetchJson } from './utils';
import { fetchSaveData } from '../../../save/saveData';

const LLAMA_API = 'https://yields.llama.fi';

interface LlamaPool {
    pool: string;
    project: string;
    symbol: string;
    chain: string;
    tvlUsd: number;
    apy: number;
    apyBase?: number;
    apyReward?: number;
    apyBaseBorrow?: number;
    ltv?: number;
    underlyingTokens?: string[];
}

interface LlamaPoolsResponse {
    status: string;
    data: LlamaPool[];
}

interface LlamaHistoryPoint {
    timestamp: string;
    tvlUsd: number;
    apy: number;
    apyBase?: number;
}

interface LlamaHistoryResponse {
    status: string;
    data: LlamaHistoryPoint[];
}

export class SaveFetcher extends BaseTokenFetcher {
    /**
     * Pobiera wszystkie pule dla Save (dawniej Solend) z DeFiLlama.
     */
    private async fetchSavePools(): Promise<LlamaPool[]> {
        try {
            const response = await fetchJson<LlamaPoolsResponse>(
                `${LLAMA_API}/pools`,
            );
            const pools = response?.data ?? [];

            return pools.filter(
                (p) =>
                    p.chain?.toLowerCase() === 'solana' &&
                    (p.project === 'save' || p.project === 'solend'),
            );
        } catch (err) {
            console.error(
                '[SaveFetcher] Error fetching pools from DeFiLlama:',
                err,
            );
            return [];
        }
    }

    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await fetchSaveData();
        } catch (err) {
            console.error('[SaveFetcher] Error mapping metrics:', err);
            return [];
        }
    }

    async fetch(
        platform: string,
        asset: string,
        collateral?: string,
    ): Promise<TokenDataResult | null> {
        const pools = await this.fetchSavePools();

        // Szukamy najlepszego dopasowania na podstawie symbolu i najwyższego TVL
        const candidates = pools
            .filter((p) => symbolMatches(p.symbol, asset))
            .sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0));

        const bestPool = candidates[0];
        if (!bestPool) {
            return null;
        }

        let history: TokenHistoryPoint[] = [];

        // Pobieranie danych historycznych z DeFiLlama
        try {
            const historyJson = await fetchJson<LlamaHistoryResponse>(
                `${LLAMA_API}/chart/${bestPool.pool}`,
            );
            const points = historyJson?.data ?? [];

            history = points.map((p) => ({
                date: p.timestamp,
                apy: parseFloat((p.apy ?? 0).toFixed(2)),
                utilization: null,
            }));
        } catch {
            // history unavailable; snapshot-only result below
        }

        const snapshot: TokenSnapshot = {
            tvl: Math.round(bestPool.tvlUsd ?? 0),
            supplyAPY: parseFloat((bestPool.apy ?? 0).toFixed(2)),
            borrowRate: parseFloat((bestPool.apyBaseBorrow ?? 0).toFixed(2)),
            utilization: 0,
        };

        return {
            history,
            poolId: bestPool.pool,
            source: 'save',
            matchedSymbol: bestPool.symbol,
            snapshot,
        };
    }
}

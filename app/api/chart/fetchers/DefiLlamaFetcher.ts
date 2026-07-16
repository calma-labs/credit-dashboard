import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';

const MIN_TVL = 1_000;

const PROTOCOL_SLUGS: Record<string, string[]> = {
    save: ['save', 'solend'],
    kamino: ['kamino-lend'],
    jupiter: ['jupiter-lend'],
    marginfi: ['marginfi'],
};

interface DefiLlamaPool {
    pool: string;
    project: string;
    chain: string;
    symbol?: string;
    tvlUsd?: number;
    apyBase?: number;
    apyReward?: number;
    apyBaseBorrow?: number;
    utilization?: number;
}

interface DefiLlamaChartEntry {
    timestamp: string;
    apyBase?: number;
    apyReward?: number;
    utilization?: number;
}

export class DefiLlamaFetcher extends BaseTokenFetcher {
    private symbolMatches(poolSymbol: string, target: string): boolean {
        const normalized = poolSymbol
            .replace(/\s*\(.*?\)/g, '')
            .replace(/-[A-Z0-9]+$/, '')
            .trim();
        return normalized === target || normalized === `W${target}`;
    }

    async fetchMetrics(): Promise<StandarizedMetric[]> {
        return [];
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult> {
        try {
            const targetSlugs = PROTOCOL_SLUGS[platform] ?? [platform];

            const poolsRes = await fetch('https://yields.llama.fi/pools', {
                next: { revalidate: 300 },
            });

            if (!poolsRes.ok) {
                return this.handleError(new Error('Failed to fetch pools'), platform, asset);
            }

            const poolsJson = await poolsRes.json();
            const pools: DefiLlamaPool[] = poolsJson.data ?? [];

            const tokenPools = targetSlugs
                .flatMap((slug) =>
                    pools.filter((p) => {
                        if (p.project !== slug || p.chain !== 'Solana') return false;
                        const poolSymbol = (p.symbol || '').toUpperCase();
                        return this.symbolMatches(poolSymbol, asset) && (p.tvlUsd ?? 0) > MIN_TVL;
                    })
                )
                .sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0));

            const tokenPool = tokenPools[0] ?? null;

            if (!tokenPool) {
                return this.getEmptyResult(asset);
            }

            const chartRes = await fetch(
                `https://yields.llama.fi/chart/${tokenPool.pool}`,
                { next: { revalidate: 300 } }
            );

            if (!chartRes.ok) {
                return this.handleError(new Error('Failed to fetch chart'), platform, asset, tokenPool.project, tokenPool.pool);
            }

            const chartJson = await chartRes.json();

            if (!chartJson.data?.length) {
                return this.getEmptyResult(asset, tokenPool.project, tokenPool.pool);
            }

            const history = chartJson.data
                .filter((entry: DefiLlamaChartEntry) => entry.timestamp && entry.apyBase !== undefined)
                .map((entry: DefiLlamaChartEntry) => ({
                    date: entry.timestamp,
                    apy: parseFloat(((entry.apyBase ?? 0) + (entry.apyReward ?? 0)).toFixed(2)),
                    utilization: entry.utilization !== undefined ? parseFloat(entry.utilization.toFixed(2)) : null,
                }));

            return {
                history,
                poolId: tokenPool.pool,
                source: tokenPool.project,
                matchedSymbol: tokenPool.symbol ?? asset,
                snapshot: {
                    tvl: Math.round(tokenPool.tvlUsd ?? 0),
                    supplyAPY: parseFloat(((tokenPool.apyBase ?? 0) + (tokenPool.apyReward ?? 0)).toFixed(2)),
                    borrowRate: parseFloat((tokenPool.apyBaseBorrow ?? 0).toFixed(2)),
                    utilization: parseFloat((tokenPool.utilization ?? 0).toFixed(2)),
                },
            };
        } catch (error) {
            return this.handleError(error, platform, asset);
        }
    }
}

import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult, TokenHistoryPoint, TokenSnapshot } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { kaminoStandarizedTokens } from '../../../kaminolend/kamino_lend';
import { symbolMatches, fetchJson } from './utils';

const KAMINO_API = 'https://api.kamino.finance';
const MAIN_MARKET = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';

interface KaminoReserveMetric {
    reserve: string;
    liquidityToken: string;
    liquidityTokenMint: string;
    supplyApy: string;
    borrowApy: string;
    totalSupply: string;
    totalBorrow: string;
    totalSupplyUsd: string;
    totalBorrowUsd: string;
}

interface KaminoHistoryMetrics {
    supplyInterestAPY: number;
    borrowInterestAPY: number;
    depositTvl: string;
    borrowTvl: string;
}

interface KaminoHistoryEntry {
    timestamp: string;
    metrics: KaminoHistoryMetrics;
}

interface KaminoHistoryResponse {
    reserve: string;
    history: KaminoHistoryEntry[];
}

export class KaminoFetcher extends BaseTokenFetcher {
    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await kaminoStandarizedTokens();
        } catch (err) {
            console.error('[KaminoFetcher] Error fetching metrics:', err);
            return [];
        }
    }



    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null> {
        const reserves = await fetchJson<KaminoReserveMetric[]>(
            `${KAMINO_API}/kamino-market/${MAIN_MARKET}/reserves/metrics`
        );

            const candidates = reserves
                .filter(r => symbolMatches(r.liquidityToken, asset))
                .sort((a, b) => parseFloat(b.totalSupplyUsd) - parseFloat(a.totalSupplyUsd));

            const bestReserve = candidates[0];
            if (!bestReserve) {
                return null;
            }

            const now = Math.floor(Date.now() / 1000);
            const start = now - 400 * 24 * 60 * 60;

            let history: TokenHistoryPoint[] = [];
            try {
                const historyJson = await fetchJson<KaminoHistoryResponse>(
                    `${KAMINO_API}/kamino-market/${MAIN_MARKET}/reserves/${bestReserve.reserve}/metrics/history` +
                    `?env=mainnet-beta&frequency=day&start=${start}&end=${now}`
                );
                const entries = historyJson.history ?? [];

                history = entries
                    .filter(e => e.timestamp && e.metrics?.supplyInterestAPY !== undefined)
                    .map(e => {
                        const depositTvl = parseFloat(e.metrics.depositTvl || '0');
                        const borrowTvl = parseFloat(e.metrics.borrowTvl || '0');
                        const utilization = depositTvl > 0 ? (borrowTvl / depositTvl) * 100 : 0;

                        return {
                            date: e.timestamp,
                            apy: parseFloat((e.metrics.supplyInterestAPY * 100).toFixed(2)),
                            utilization: parseFloat(utilization.toFixed(2)),
                        };
                    });
            } catch (err) {
                console.warn('[KaminoFetcher] Kamino history API failed, returning snapshot only', err);
            }

            const totalSupply = parseFloat(bestReserve.totalSupply || '0');
            const totalBorrow = parseFloat(bestReserve.totalBorrow || '0');
            const utilization = totalSupply > 0 ? (totalBorrow / totalSupply) * 100 : 0;

            const snapshot: TokenSnapshot = {
                tvl: Math.round(parseFloat(bestReserve.totalSupplyUsd || '0')),
                supplyAPY: parseFloat((parseFloat(bestReserve.supplyApy) * 100).toFixed(2)),
                borrowRate: parseFloat((parseFloat(bestReserve.borrowApy) * 100).toFixed(2)),
                utilization: parseFloat(utilization.toFixed(2)),
            };

            return {
                history,
                poolId: bestReserve.reserve,
                source: 'kamino',
                matchedSymbol: bestReserve.liquidityToken,
                snapshot,
            };
    }
}

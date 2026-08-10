import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult, TokenHistoryPoint, TokenSnapshot } from './types';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { fetchSaveData } from '../../../save/saveData';
import { symbolMatches, downsampleToDaily, fetchJson } from './utils';

const SAVE_API = 'https://api.solend.fi';

interface SaveReserveConfig {
    address: string;
    liquidityToken?: {
        symbol?: string;
        mint?: string;
    };
}

interface SaveMarketConfig {
    name: string;
    isPrimary?: boolean;
    reserves?: SaveReserveConfig[];
}

interface SaveHistoryPoint {
    supplyAPY: number;
    borrowAPY: number;
    supplyAPR: number;
    borrowAPR: number;
    timestamp: number;
    reserveID: string;
}

interface SaveReserveResult {
    rates?: {
        supplyInterest?: string;
        borrowInterest?: string;
    };
    reserve?: {
        liquidity?: {
            mintDecimals?: number;
            borrowedAmountWads?: string;
            availableAmount?: string;
            marketPrice?: string;
        };
    };
}

interface SaveReservesResponse {
    results?: SaveReserveResult[];
}

export class SaveFetcher extends BaseTokenFetcher {
    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await fetchSaveData();
        } catch (err) {
            console.error('[SaveFetcher] Error fetching metrics:', err);
            return [];
        }
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null> {
        const configs = await fetchJson<SaveMarketConfig[]>(
            `${SAVE_API}/v1/markets/configs?scope=all`
        );
            const mainMarket = configs.find(m => m.name === 'Main' || m.isPrimary);

            if (!mainMarket?.reserves) {
                return null;
            }

            const reserve = mainMarket.reserves.find(r => 
                symbolMatches(r.liquidityToken?.symbol ?? '', asset)
            );

            if (!reserve) {
                return null;
            }

            const now = Math.floor(Date.now() / 1000);
            const start = now - 400 * 24 * 60 * 60;

            let history: TokenHistoryPoint[] = [];
            try {
                const historyJson = await fetchJson<Record<string, SaveHistoryPoint[]>>(
                    `${SAVE_API}/v1/reserves/historical-interest-rates?ids=${reserve.address}&start=${start}&end=${now}`
                );
                const points: SaveHistoryPoint[] = historyJson[reserve.address] ?? [];

                history = downsampleToDaily(
                    points,
                    (p) => p.timestamp,
                    (p, dateKey) => ({
                        date: new Date(dateKey).toISOString(),
                        apy: parseFloat((p.supplyAPY * 100).toFixed(2)),
                        utilization: null,
                    })
                );
            } catch (err) {
                console.warn('[SaveFetcher] Solend history API failed, returning snapshot only', err);
            }

            let snapshot: TokenSnapshot | null = null;
            try {
                const reservesJson = await fetchJson<SaveReservesResponse>(`${SAVE_API}/v1/reserves?ids=${reserve.address}`);
                const results = reservesJson?.results ?? [];
                const entry = results[0];

                if (entry) {
                    const rates = entry.rates ?? {};
                    const liq = entry.reserve?.liquidity ?? {};

                    const WADS = 1e18;
                    const DECIMALS = Math.pow(10, liq.mintDecimals ?? 6);
                    const borrowed = parseFloat(liq.borrowedAmountWads ?? '0') / WADS / DECIMALS;
                    const available = parseFloat(liq.availableAmount ?? '0') / DECIMALS;
                    const total = borrowed + available;
                    const utilization = total > 0 ? (borrowed / total) * 100 : 0;
                    const marketPrice = parseFloat(liq.marketPrice ?? '0');
                    let tvl = total > 0 && marketPrice > 0 ? Math.round(total * marketPrice) : 0;
                    tvl = tvl / WADS;

                    snapshot = {
                        tvl,
                        supplyAPY: parseFloat(parseFloat(rates.supplyInterest ?? '0').toFixed(2)),
                        borrowRate: parseFloat(parseFloat(rates.borrowInterest ?? '0').toFixed(2)),
                        utilization: parseFloat(utilization.toFixed(2)),
                    };
                }
            } catch (err) {
                console.warn('[SaveFetcher] Failed to fetch current reserves snapshot', err);
            }

            return {
                history,
                poolId: reserve.address,
                source: 'save',
                matchedSymbol: asset,
                snapshot,
            };
    }
}

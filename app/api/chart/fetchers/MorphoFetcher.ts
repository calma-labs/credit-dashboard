import { BaseTokenFetcher } from './BaseTokenFetcher';
import { TokenDataResult, TokenHistoryPoint, TokenSnapshot } from './types';
import {
    MorphoMarketsResponse,
    MorphoHistoryResponse,
    MorphoMarketSummary,
    MorphoMarketDetailState,
    TimeseriesPoint,
} from '../../../morpho/morphoTypes';
import { type StandarizedMetric } from '../../../globalComponents/globalTypes';
import { morphoStandarizedTokens } from '../../../morpho/morpho_lend';

const MORPHO_API = 'https://api.morpho.org/graphql';
const MIN_TVL = 100_000;

export class MorphoFetcher extends BaseTokenFetcher {
    async fetchMetrics(): Promise<StandarizedMetric[]> {
        try {
            return await morphoStandarizedTokens();
        } catch (err) {
            console.error('[MorphoFetcher] Error fetching metrics:', err);
            return [];
        }
    }

    private async fetchMorphoMarkets(): Promise<{ res: Response; json: MorphoMarketsResponse }> {
        const query = `
            query {
                markets(
                    first: 200
                    orderBy: SupplyAssetsUsd
                    orderDirection: Desc
                    where: { chainId_in: [1, 8453], listed: true }
                ) {
                    items {
                        marketId
                        chain { id }
                        loanAsset { symbol }
                        collateralAsset { symbol }
                        lltv
                        state { supplyAssetsUsd }
                    }
                }
            }
        `;

        const res = await fetch(MORPHO_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            next: { revalidate: 300 },
        });

        const json: MorphoMarketsResponse = await res.json();
        return { res, json };
    }

    private buildSnapshot(state: MorphoMarketDetailState | null | undefined, lltv?: string | null) {
        if (!state) return null;

        return {
            tvl: state.supplyAssetsUsd !== null && state.supplyAssetsUsd !== undefined ? Math.round(state.supplyAssetsUsd) : 0,
            supplyAPY: state.supplyApy !== null && state.supplyApy !== undefined ? parseFloat((state.supplyApy * 100).toFixed(2)) : 0,
            borrowRate: state.borrowApy !== null && state.borrowApy !== undefined ? parseFloat((state.borrowApy * 100).toFixed(2)) : 0,
            utilization: state.utilization !== null && state.utilization !== undefined ? parseFloat((state.utilization * 100).toFixed(2)) : 0,
            lltv: lltv ? parseFloat(lltv) * 100 : null,
        };
    }

    async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null> {
        try {
            const { res: marketsRes, json: marketsJson } = await this.fetchMorphoMarkets();

            if (!marketsRes.ok) {
                return this.handleError(new Error('Failed to fetch morpho markets'), platform, asset);
            }

            const markets: MorphoMarketSummary[] = marketsJson.data?.markets?.items ?? [];

            const candidates = markets.filter((m) => {
                const marketSymbol = m.loanAsset.symbol.toUpperCase();
                return (marketSymbol === asset || marketSymbol === `W${asset}`) && m.state.supplyAssetsUsd > MIN_TVL;
            });

            if (candidates.length === 0) {
                return null;
            }

            const best = candidates.reduce((a, b) =>
                b.state.supplyAssetsUsd > a.state.supplyAssetsUsd ? b : a
            );

            const now = Math.floor(Date.now() / 1000);
            const stableNow = now - (now % 600);
            const startTimestamp = stableNow - 400 * 24 * 60 * 60;

            const historyQuery = `
                query MarketApys($marketId: String!, $chainId: Int!, $options: TimeseriesOptions) {
                    marketById(marketId: $marketId, chainId: $chainId) {
                        state {
                            supplyAssetsUsd
                            borrowAssetsUsd
                            utilization
                            supplyApy
                            borrowApy
                        }
                        historicalState {
                            supplyApy(options: $options) { x y }
                        }
                    }
                }
            `;

            const historyRes = await fetch(MORPHO_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: historyQuery,
                    variables: {
                        marketId: best.marketId,
                        chainId: best.chain.id,
                        options: {
                            startTimestamp,
                            endTimestamp: stableNow,
                            interval: 'DAY',
                        },
                    },
                }),
                next: { revalidate: 300 },
            });

            if (!historyRes.ok) {
                return this.handleError(new Error('Failed to fetch morpho history'), platform, asset, 'morpho', best.marketId);
            }

            const historyJson: MorphoHistoryResponse = await historyRes.json();
            const marketData = historyJson.data?.marketById;

            const points: TimeseriesPoint[] = marketData?.historicalState?.supplyApy ?? [];

            const history = points.map((p) => ({
                date: new Date(p.x * 1000).toISOString(),
                apy: parseFloat((p.y * 100).toFixed(2)),
                utilization: null,
            }));

            return {
                history,
                poolId: best.marketId,
                source: 'morpho',
                matchedSymbol: asset,
                snapshot: this.buildSnapshot(marketData?.state, best.lltv),
            };
        } catch (error) {
            return this.handleError(error, platform, asset);
        }
    }
}

import {
    type MorphoMarketsResponse,
    type MorphoHistoryResponse,
    type MorphoMarketSummary,
    type MorphoMarketDetailState,
    type MorphoDebugResult,
    type MorphoHistoryPoint,
    type MorphoSnapshot,
    type MorphoHistoryResult,
    type TimeseriesPoint,
} from './morphoTypes';

const MORPHO_API = 'https://api.morpho.org/graphql';
const MIN_TVL = 1_000;

async function fetchMorphoMarkets(): Promise<{
    res: Response;
    json: MorphoMarketsResponse;
}> {
    const query = `
        query {
            markets(
                first: 100
                orderBy: SupplyAssetsUsd
                orderDirection: Desc
                where: { chainId_in: [1, 8453], listed: true }
            ) {
                items {
                    marketId
                    chain { id }
                    loanAsset { symbol }
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

export async function fetchMorphoDebug(): Promise<MorphoDebugResult> {
    const { res, json } = await fetchMorphoMarkets();

    return {
        httpStatus: res.status,
        errors: json.errors ?? null,
        itemCount: json.data?.markets?.items?.length ?? 0,
        sample: (json.data?.markets?.items ?? []).slice(0, 5),
    };
}

function buildSnapshot(
    state: MorphoMarketDetailState | null | undefined,
): MorphoSnapshot | null {
    if (!state) return null;

    return {
        tvl:
            state.supplyAssetsUsd !== null
                ? Math.round(state.supplyAssetsUsd)
                : null,
        supplyAPY:
            state.supplyApy !== null
                ? parseFloat((state.supplyApy * 100).toFixed(2))
                : null,
        borrowRate:
            state.borrowApy !== null
                ? parseFloat((state.borrowApy * 100).toFixed(2))
                : null,
        utilization:
            state.utilization !== null
                ? parseFloat((state.utilization * 100).toFixed(2))
                : null,
    };
}

export async function fetchMorphoHistory(
    symbol: string,
): Promise<MorphoHistoryResult> {
    const { res: marketsRes, json: marketsJson } = await fetchMorphoMarkets();

    if (!marketsRes.ok) {
        return { history: [], poolId: null, source: null, snapshot: null };
    }

    const markets: MorphoMarketSummary[] =
        marketsJson.data?.markets?.items ?? [];

    const candidates = markets.filter((m) => {
        const marketSymbol = m.loanAsset.symbol.toUpperCase();
        return (
            (marketSymbol === symbol || marketSymbol === `W${symbol}`) &&
            m.state.supplyAssetsUsd > MIN_TVL
        );
    });

    if (candidates.length === 0) {
        return { history: [], poolId: null, source: null, snapshot: null };
    }

    const best = candidates.reduce((a, b) =>
        b.state.supplyAssetsUsd > a.state.supplyAssetsUsd ? b : a,
    );

    const now = Math.floor(Date.now() / 1000);
    const startTimestamp = now - 400 * 24 * 60 * 60;

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
                    endTimestamp: now,
                    interval: 'DAY',
                },
            },
        }),
        next: { revalidate: 300 },
    });

    if (!historyRes.ok) {
        return {
            history: [],
            poolId: best.marketId,
            source: 'morpho',
            snapshot: null,
        };
    }

    const historyJson: MorphoHistoryResponse = await historyRes.json();
    const marketData = historyJson.data?.marketById;

    const points: TimeseriesPoint[] =
        marketData?.historicalState?.supplyApy ?? [];

    const history: MorphoHistoryPoint[] = points.map((p) => ({
        date: new Date(p.x * 1000).toISOString(),
        apy: parseFloat((p.y * 100).toFixed(2)),
        utilization: null,
    }));

    return {
        history,
        poolId: best.marketId,
        source: 'morpho',
        matchedSymbol: symbol,
        snapshot: buildSnapshot(marketData?.state),
    };
}

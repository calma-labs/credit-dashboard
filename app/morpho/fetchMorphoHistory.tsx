import { NextRequest, NextResponse } from 'next/server';

const MIN_TVL = 1_000;
const MORPHO_API = 'https://api.morpho.org/graphql';


export async function fetchMorphoDebug() {
    const { res, json } = await fetchMorphoMarkets();

    return {
        httpStatus: res.status,
        errors: json.errors ?? null,
        itemCount: json?.data?.markets?.items?.length ?? 0,
        sample: (json?.data?.markets?.items ?? []).slice(0, 5),
    };
}

async function fetchMorphoMarkets() {
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

    const json = await res.json();

    return { res, json };
}

export async function fetchMorphoHistory(symbol: string) {
    const { res: marketsRes, json: marketsJson } = await fetchMorphoMarkets();

    if (!marketsRes.ok) {
        return { history: [], poolId: null, source: null };
    }

    const markets: any[] = marketsJson?.data?.markets?.items ?? [];

    const candidates = markets.filter((m) => {
        const marketSymbol = m.loanAsset.symbol.toUpperCase();
        return (marketSymbol === symbol || marketSymbol === `W${symbol}`) && m.state.supplyAssetsUsd > MIN_TVL;
    });

    if (candidates.length === 0) {
        return { history: [], poolId: null, source: null };
    }

    const best = candidates.reduce((a, b) =>
        b.state.supplyAssetsUsd > a.state.supplyAssetsUsd ? b : a
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
        return { history: [], poolId: best.marketId, source: 'morpho' };
    }

    const historyJson = await historyRes.json();
    const marketData = historyJson?.data?.marketById;

    const points = marketData?.historicalState?.supplyApy ?? [];

    const history = points.map((p: any) => ({
        date: new Date(p.x * 1000).toISOString(),
        apy: parseFloat((p.y * 100).toFixed(2)),
        utilization: null,
    }));

    const state = marketData?.state;

    return {
        history,
        poolId: best.marketId,
        source: 'morpho',
        matchedSymbol: symbol,
        snapshot: state ? {
            tvl: Math.round(state.supplyAssetsUsd ?? 0),
            supplyAPY: parseFloat(((state.supplyApy ?? 0) * 100).toFixed(2)),
            borrowRate: parseFloat(((state.borrowApy ?? 0) * 100).toFixed(2)),
            utilization: parseFloat(((state.utilization ?? 0) * 100).toFixed(2)),
        } : undefined,
    };
}
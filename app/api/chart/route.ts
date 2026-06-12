import { NextRequest, NextResponse } from 'next/server';

const MIN_TVL = 10_000;

const PROTOCOL_SLUGS: Record<string, string[]> = {
    save: ['save', 'solend'],
    kamino: ['kamino-lend'],
    jupiter: ['jupiter-lend'],
    marginfi: ['marginfi'],
};

function symbolMatches(poolSymbol: string, target: string): boolean {
    const normalized = poolSymbol
        .replace(/\s*\(.*?\)/g, '')
        .replace(/-[A-Z0-9]+$/, '')
        .trim();
    return normalized === target || normalized === `W${target}`;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbol = searchParams.get('symbol')?.toUpperCase() || 'USDC';
        const protocol = searchParams.get('protocol')?.toLowerCase() || 'kamino';
        const debug = searchParams.get('debug') === '1';

        const targetSlugs = PROTOCOL_SLUGS[protocol] ?? [protocol];

        const poolsRes = await fetch('https://yields.llama.fi/pools', {
            next: { revalidate: 300 },
        });

        if (!poolsRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 502 });
        }

        const poolsJson = await poolsRes.json();
        const pools: any[] = poolsJson.data ?? [];

        const tokenPools = targetSlugs
            .flatMap((slug) =>
                pools.filter((p) => {
                    if (p.project !== slug || p.chain !== 'Solana') return false;
                    const poolSymbol = (p.symbol || '').toUpperCase();
                    return symbolMatches(poolSymbol, symbol) && (p.tvlUsd ?? 0) > MIN_TVL;
                })
            )
            .sort((a, b) => b.tvlUsd - a.tvlUsd);

        if (debug) {
            const allForProtocol = pools.filter(
                (p) => targetSlugs.includes(p.project) && p.chain === 'Solana'
            );
            return NextResponse.json({
                allPools: allForProtocol.map((p) => ({
                    pool: p.pool,
                    symbol: p.symbol,
                    poolMeta: p.poolMeta,
                    tvlUsd: p.tvlUsd,
                    project: p.project,
                })),
                matched: tokenPools.map((p) => ({
                    pool: p.pool,
                    symbol: p.symbol,
                    poolMeta: p.poolMeta,
                    tvlUsd: p.tvlUsd,
                })),
            });
        }

        const tokenPool = tokenPools[0] ?? null;

        if (!tokenPool) {
            return NextResponse.json({ history: [], poolId: null, source: null });
        }

        const chartRes = await fetch(
            `https://yields.llama.fi/chart/${tokenPool.pool}`,
            { next: { revalidate: 300 } }
        );

        if (!chartRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch chart' }, { status: 502 });
        }

        const chartJson = await chartRes.json();

        if (!chartJson.data?.length) {
            return NextResponse.json({
                history: [],
                poolId: tokenPool.pool,
                source: tokenPool.project,
                matchedSymbol: tokenPool.symbol,
            });
        }

        const history = chartJson.data
            .filter((entry: any) => entry.timestamp && entry.apyBase !== undefined)
            .map((entry: any) => ({
                date: entry.timestamp,
                apy: parseFloat(((entry.apyBase ?? 0) + (entry.apyReward ?? 0)).toFixed(2)),
                utilization: entry.utilization !== undefined ? parseFloat(entry.utilization.toFixed(2)) : null,
            }));

        return NextResponse.json({
    history,
    poolId: tokenPool.pool,
    source: tokenPool.project,
    matchedSymbol: tokenPool.symbol,
    snapshot: {
    tvl:         Math.round(tokenPool.tvlUsd ?? 0),
    supplyAPY:   parseFloat(((tokenPool.apyBase ?? 0) + (tokenPool.apyReward ?? 0)).toFixed(2)),
    borrowRate:  parseFloat((tokenPool.apyBaseBorrow ?? 0).toFixed(2)),
    utilization: parseFloat((tokenPool.utilization ?? 0).toFixed(2)),
},
});
    } catch (err) {
        console.error('[chart route]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
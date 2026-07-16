import { NextRequest, NextResponse } from 'next/server';
import { fetchMorphoDebug } from '@/app/morpho/fetchMorphoHistory';
import { FetchingManager } from './fetchers/FetchingManager';

const MIN_TVL = 1_000;

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
        const collateral = searchParams.get('collateral') || undefined;
        const debug = searchParams.get('debug') === '1';

        if (debug) {
            if (protocol === 'morpho') {
                const result = await fetchMorphoDebug();
                return NextResponse.json(result);
            }

            const targetSlugs = PROTOCOL_SLUGS[protocol] ?? [protocol];
            const poolsRes = await fetch('https://yields.llama.fi/pools', { next: { revalidate: 300 } });

            if (!poolsRes.ok) {
                return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 502 });
            }

            const poolsJson = await poolsRes.json();
            const pools: any[] = poolsJson.data ?? [];

            const allForProtocol = pools.filter(p => targetSlugs.includes(p.project) && p.chain === 'Solana');
            const tokenPools = targetSlugs
                .flatMap((slug) =>
                    pools.filter((p) => {
                        if (p.project !== slug || p.chain !== 'Solana') return false;
                        const poolSymbol = (p.symbol || '').toUpperCase();
                        return symbolMatches(poolSymbol, symbol) && (p.tvlUsd ?? 0) > MIN_TVL;
                    })
                )
                .sort((a, b) => b.tvlUsd - a.tvlUsd);

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

        const fetcher = FetchingManager.getFetcher(protocol);
        const result = await fetcher.fetch(protocol, symbol, collateral);

        if (result.history.length === 0 && !result.poolId) {
            return NextResponse.json({ history: [], poolId: null, source: null });
        }

        return NextResponse.json(result);

    } catch (err) {
        console.error('[chart route]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
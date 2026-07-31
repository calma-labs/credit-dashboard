import {
    getLends,
    getSymbols,
    getStandarizedTokensList,
} from './lendingFetchApp';
import { type StandarizedMetric } from './globalComponents/globalTypes';
import MainLayout from './MainLayout';
import './globalStyles/cardStyle.css';

export const dynamic = 'force-dynamic';

function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

function formatTVL(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
}

export default async function App() {
    const [lends, tokenSymbols, tokensList] = await Promise.all([
        getLends(),
        getSymbols(),
        getStandarizedTokensList(),
    ]);

    const chains = [...new Set(tokensList.map((t) => t.chain).filter(Boolean))];
    const collaterals = [
        ...new Set(
            tokensList
                .map((t) => t.collateral?.toUpperCase())
                .filter((c): c is string => !!c),
        ),
    ];

    const totalTVL = tokensList.reduce((sum, t) => sum + t.tvl, 0);
    const allAPYs = tokensList.map((t) => t.supplyAPY).filter((a) => a > 0);
    const medAPY = median(allAPYs);

    const topToken = tokensList.reduce(
        (best, t) => (t.supplyAPY > (best?.supplyAPY ?? 0) ? t : best),
        null as StandarizedMetric | null,
    );

    const stats = {
        totalTVL: formatTVL(totalTVL),
        protocolCount: lends.length,
        chainCount: chains.length,
        medianAPY: medAPY.toFixed(1),
        highestAPY: topToken?.supplyAPY?.toFixed(1) ?? '—',
        highestAPYLabel: topToken
            ? `${topToken.lending} · ${topToken.symbol}`
            : '',
    };

    return (
        <MainLayout
            tokens={tokensList}
            lends={lends}
            symbols={tokenSymbols}
            chains={chains}
            collaterals={collaterals}
            stats={stats}
        />
    );
}

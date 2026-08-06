import { KaminoFetcher } from '@/app/api/chart/fetchers/KaminoFetcher';
import { standarizedJupLendToken } from '@/app/juplend/hooks/useJupLendData';
import { fetchSaveData } from '@/app/save/saveData';
import { morphoStandarizedTokens } from '@/app/morpho/morpho_lend';
import { TokenDetailView } from '@/app/api/chart/TokenChartDialog';
import { type StandarizedMetric } from '@/app/globalComponents/globalTypes';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'beaver finance',
};

type PlatformSnapshot = StandarizedMetric & { protocol: string };

function normalizeSymbol(symbol: string): string {
    return symbol.toUpperCase().replace(/^W(?=[A-Z])/, '');
}

function findBestMatch(
    tokens: StandarizedMetric[],
    target: string,
): StandarizedMetric | undefined {
    const matches = tokens.filter(
        (t) => normalizeSymbol(t.symbol) === normalizeSymbol(target),
    );
    if (matches.length === 0) return undefined;
    return matches.reduce((best, current) =>
        current.tvl > best.tvl ? current : best,
    );
}

export default async function TokenPage({
    params,
}: {
    params: Promise<{ symbol: string }>;
}) {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();
    const kaminoFetcher = new KaminoFetcher();

    const [KAMINO_DATA, JUPLEND_DATA, SAVE_DATA, MORPHO_DATA] =
        await Promise.all([
            kaminoFetcher.fetchMetrics(),
            standarizedJupLendToken(),
            fetchSaveData(),
            morphoStandarizedTokens(),
        ]);

    const kaminoToken = findBestMatch(KAMINO_DATA, upperSymbol);
    // ...
    const jupToken = findBestMatch(JUPLEND_DATA, upperSymbol);
    const saveToken = findBestMatch(SAVE_DATA, upperSymbol);
    const morphoToken = findBestMatch(MORPHO_DATA, upperSymbol);

    const snapshots: PlatformSnapshot[] = [
        kaminoToken ? { protocol: 'kamino', ...kaminoToken } : null,
        jupToken ? { protocol: 'jupiter', ...jupToken } : null,
        saveToken ? { protocol: 'save', ...saveToken } : null,
        morphoToken ? { protocol: 'morpho', ...morphoToken } : null,
    ].filter((s): s is PlatformSnapshot => s !== null);

    return <TokenDetailView symbol={upperSymbol} snapshots={snapshots} />;
}

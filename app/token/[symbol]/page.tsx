import { kaminoStandarizedTokens } from '@/app/kaminolend/kamino_lend';
import { standarizedJupLendToken } from '@/app/juplend/hooks/useJupLendData';
import { fetchSaveData } from '@/app/save/saveData';
import { TokenDetailView } from '@/app/api/chart/TokenChartDialog';
import { type StandarizedMetric } from '@/app/globalComponents/globalTypes';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Credit dashboard',
};

function normalizeSymbol(symbol: string): string {
    return symbol
        .toUpperCase()
        .replace(/^W(?=[A-Z])/, '');
}

function findBestMatch(tokens: StandarizedMetric[], target: string): StandarizedMetric | undefined {
    const matches = tokens.filter(t => normalizeSymbol(t.symbol) === normalizeSymbol(target));
    if (matches.length === 0) return undefined;
    return matches.reduce((best, current) => (current.tvl > best.tvl ? current : best));
}

export default async function TokenPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const [KAMINO_DATA, JUPLEND_DATA, SAVE_DATA] = await Promise.all([
        kaminoStandarizedTokens(),
        standarizedJupLendToken(),
        fetchSaveData(),
    ]);

    const kaminoToken = findBestMatch(KAMINO_DATA, upperSymbol);
    const jupToken = findBestMatch(JUPLEND_DATA, upperSymbol);
    const saveToken = findBestMatch(SAVE_DATA, upperSymbol);

    const snapshots = [
        kaminoToken ? {
            protocol:    'kamino',
            tvl:         kaminoToken.tvl,
            supplyAPY:   kaminoToken.supplyAPY,
            utilization: kaminoToken.utilization,
            borrowRate:  kaminoToken.borrowRate,
        } : null,
        jupToken ? {
            protocol:    'jupiter',
            tvl:         jupToken.tvl,
            supplyAPY:   jupToken.supplyAPY,
            utilization: jupToken.utilization,
            borrowRate:  jupToken.borrowRate,
        } : null,
        saveToken ? {
            protocol:    'save',
            tvl:         saveToken.tvl,
            supplyAPY:   saveToken.supplyAPY,
            utilization: saveToken.utilization,
            borrowRate:  saveToken.borrowRate,
        } : null,
    ].filter(Boolean) as any[];

    return <TokenDetailView symbol={upperSymbol} snapshots={snapshots} />;
}
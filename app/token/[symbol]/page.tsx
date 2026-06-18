import { fetchReserves, getSlotForAPY } from '@/app/kaminolend/kamino_lend';
import { useJupLendData } from '@/app/juplend/hooks/useJupLendData';
import { fetchSaveData } from '@/app/save/useSaveData';
import { KaminoReserve } from '@kamino-finance/klend-sdk';
import { TokenDetailView } from '@/app/api/chart/TokenChartDialog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Credit dashboard',
};

function kaminoTVL(token: KaminoReserve) {
    return Number(token.getDepositTvl().toFixed(2));
}
function kaminoUtilization(token: KaminoReserve) {
    return Number((token.calculateUtilizationRatio() * 100).toFixed(2));
}
function kaminoBorrowRate(token: KaminoReserve, slot: number) {
    return Number((token.calculateBorrowAPR(BigInt(slot), Math.floor(token.calculateUtilizationRatio() * 10000)) * 100).toFixed(2));
}
function kaminoSupplyAPY(token: KaminoReserve, slot: number) {
    return Number((token.totalSupplyAPY(BigInt(slot)) * 100).toFixed(2));
}

export default async function TokenPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const KAMINO_DATA = await fetchReserves();
    const JUPLEND_DATA = await useJupLendData();
    const slot = await getSlotForAPY();

    const kaminoToken = KAMINO_DATA.find(k => k.symbol === upperSymbol);
    const jupToken = JUPLEND_DATA.tokens.find(j => j.symbol === upperSymbol);

    const saveData = kaminoToken
        ? await fetchSaveData(kaminoToken.tokenOraclePrice.mintAddress)
        : null;

    const snapshots = [
        kaminoToken ? {
            protocol:    'kamino',
            tvl:         kaminoTVL(kaminoToken),
            supplyAPY:   kaminoSupplyAPY(kaminoToken, slot),
            utilization: kaminoUtilization(kaminoToken),
            borrowRate:  kaminoBorrowRate(kaminoToken, slot),
        } : null,
        jupToken ? {
            protocol:    'jupiter',
            tvl:         Number(jupToken.tvlUsd),
            supplyAPY:   Number(jupToken.apy.toFixed(2)),
            utilization: Number(jupToken.utilization.toFixed(2)),
            borrowRate:  Number(jupToken.borrowRate.toFixed(2)),
        } : null,
        saveData ? {
            protocol:    'save',
            tvl:         saveData.tvl,
            supplyAPY:   saveData.supplyAPY,
            utilization: saveData.utilization,
            borrowRate:  saveData.borrowRate,
        } : null,
    ].filter(Boolean) as any[];

    return <TokenDetailView symbol={upperSymbol} snapshots={snapshots} />;
}
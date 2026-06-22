import { QueryClient } from '@tanstack/react-query';
import { type StandarizedMetric } from '../globalComponents/globalTypes';

const queryClient = new QueryClient();

async function fetchMarketConfigs(): Promise<any[]> {
  const res = await fetch('https://api.solend.fi/v1/markets/configs?scope=all', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch Save market configs');
  return res.json();
}

export async function fetchSaveData(mintAddress: string) {
  const marketConfigs = await queryClient.fetchQuery({
    queryKey: ['saveMarketConfigs'],
    queryFn: fetchMarketConfigs,
    staleTime: 5 * 60 * 1000,
  });

  let reserveId: string | undefined;

  const mainMarket = marketConfigs.find((m: any) => m.name === 'Main' || m.isPrimary);
  if (mainMarket) {
    const reserve = mainMarket.reserves.find((r: any) => r.liquidityToken.mint === mintAddress);
    if (reserve) reserveId = reserve.address;
  }

  if (!reserveId) {
    for (const market of marketConfigs) {
      const reserve = market.reserves.find((r: any) => r.liquidityToken.mint === mintAddress);
      if (reserve) {
        reserveId = reserve.address;
        break;
      }
    }
  }

  if (!reserveId) return null;

  const reserveRes = await fetch(`https://api.solend.fi/v1/reserves?ids=${reserveId}`, { cache: 'no-store' });
  if (!reserveRes.ok) return null;

  const reserveJson = await reserveRes.json();
  const entry = reserveJson?.results?.find((r: any) => r?.reserve?.pubkey === reserveId || r?.pubkey === reserveId);
  if (!entry) return null;

  const rates = entry.rates ?? {};
  const liq = entry.reserve?.liquidity ?? {};

  const WAD = 1e18;
  const DECIMALS = Math.pow(10, liq.mintDecimals ?? 6);

  const priceUsd = Number(liq.marketPrice ?? 0) / WAD;
  const availableTokens = Number(liq.availableAmount ?? 0) / DECIMALS;
  const borrowedTokens = Number(liq.borrowedAmountWads ?? 0) / WAD / DECIMALS;

  const tvl = availableTokens * priceUsd;
  const totalSupplyUsd = (availableTokens + borrowedTokens) * priceUsd;
  const utilization = totalSupplyUsd > 0 ? Number(((borrowedTokens * priceUsd) / totalSupplyUsd * 100).toFixed(2)) : 0;

  return {
    mintAddress,
    tvl,
    utilization,
    supplyAPY: Number(parseFloat(rates.supplyInterest ?? '0').toFixed(2)),
    borrowRate: Number(parseFloat(rates.borrowInterest ?? '0').toFixed(2)),
  };
}
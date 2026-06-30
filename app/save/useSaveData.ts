import { QueryClient } from '@tanstack/react-query';
import { type StandarizedMetric } from '../globalComponents/globalTypes';

const queryClient = new QueryClient();

interface SaveReserveConfig {
  address: string;
  liquidityToken: { mint: string };
}

interface SaveMarketConfig {
  name?: string;
  isPrimary?: boolean;
  reserves: SaveReserveConfig[];
}

interface SaveReserveLiquidity {
  marketPrice?: string;
  availableAmount?: string;
  borrowedAmountWads?: string;
  mintDecimals?: number;
}

interface SaveReserveRates {
  supplyInterest?: string;
  borrowInterest?: string;
}

interface ReserveEntry {
  pubkey?: string;
  reserve?: { pubkey?: string; liquidity?: SaveReserveLiquidity };
  rates?: SaveReserveRates;
}

interface ReserveQueryResult {
  results?: ReserveEntry[];
}

async function fetchMarketConfigs(): Promise<SaveMarketConfig[]> {
  const res = await fetch('https://api.solend.fi/v1/markets/configs?scope=all', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch Save market configs');
  return res.json();
}

async function fetchReserveById(id: string): Promise<ReserveQueryResult> {
  const res = await fetch(`https://api.solend.fi/v1/reserves?ids=${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch Save reserve');
  return res.json();
}

export async function fetchSaveData(mintAddress: string) {
  const marketConfigs = await queryClient.fetchQuery({
    queryKey: ['saveMarketConfigs'],
    queryFn: fetchMarketConfigs,
    staleTime: 5 * 60 * 1000,
  });

  let reserveId: string | undefined;

  const mainMarket = marketConfigs.find((m) => m.name === 'Main' || m.isPrimary);
  if (mainMarket) {
    const reserve = mainMarket.reserves.find((r) => r.liquidityToken.mint === mintAddress);
    if (reserve) reserveId = reserve.address;
  }

  if (!reserveId) {
    for (const market of marketConfigs) {
      const reserve = market.reserves.find((r) => r.liquidityToken.mint === mintAddress);
      if (reserve) {
        reserveId = reserve.address;
        break;
      }
    }
  }

  if (!reserveId) {
    console.warn(`No Save reserve found for mint: ${mintAddress}`);
    return null;
  }

  let results: ReserveEntry[];
  try {
    const data = await queryClient.fetchQuery({
      queryKey: ['saveReserve', reserveId],
      queryFn: () => fetchReserveById(reserveId!),
      staleTime: 5 * 60 * 1000,
    });
    results = data.results ?? [];
  } catch (err) {
    console.error('Solend API Error:', err);
    return null;
  }

  if (!results.length) return null;

  let entry = results.find((r) => r?.reserve?.pubkey === reserveId || r?.pubkey === reserveId);
  if (!entry) {
    entry = results.find((r) => r?.reserve?.liquidity);
  }
  if (!entry) {
    console.warn('No reserve data from Solend API');
    return null;
  }

  const rates = entry.rates;
  if (!rates || rates.supplyInterest == null || rates.borrowInterest == null) return null;

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
    supplyAPY: Number(parseFloat(rates.supplyInterest).toFixed(2)),
    borrowRate: Number(parseFloat(rates.borrowInterest).toFixed(2)),
  };
}
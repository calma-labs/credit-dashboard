import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();
type LiquidityToken = {
  mint: string;
};

type MarketReserve = {
  address: string;
  liquidityToken: LiquidityToken;
};

type MarketConfig = {
  name: string;
  isPrimary?: boolean;
  reserves: MarketReserve[];
};

type ReserveLiquidity = {
  mintDecimals?: number;
  borrowedAmountWads?: string;
  availableAmount?: string;
  marketPrice?: string;
};

type ReserveEntry = {
  pubkey?: string;
  reserve?: {
    pubkey?: string;
    liquidity?: ReserveLiquidity;
  };
  rates?: {
    supplyInterest?: string;
    borrowInterest?: string;
  };
};

async function fetchMarketConfigs(): Promise<MarketConfig[]> {
  const res = await fetch('https://api.solend.fi/v1/markets/configs?scope=all', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch Save market configs');
  return res.json();
}
async function fetchReserveById(reserveId: string): Promise<{ results: ReserveEntry[] }> {
  const res = await fetch(`https://api.solend.fi/v1/reserves?ids=${reserveId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Solend API Error: ${res.status}`);
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

  let entry = results.find((r) =>
    r?.reserve?.pubkey === reserveId || r?.pubkey === reserveId
  );
  if (!entry) {
    entry = results.find((r) => r?.reserve?.liquidity);
  }

  if (!entry) {
    console.warn('No reserve data from Solend API');
    return null;
  }

  const rates = entry.rates ?? {};
  const liq = entry.reserve?.liquidity ?? {};

  const supplyAPY = Number(parseFloat(rates.supplyInterest ?? '0').toFixed(2));
  const borrowRate = Number(parseFloat(rates.borrowInterest ?? '0').toFixed(2));

  const WADS = 1e18;
  const DECIMALS = Math.pow(10, liq.mintDecimals ?? 6);
  const borrowed = parseFloat(liq.borrowedAmountWads ?? '0') / WADS / DECIMALS;
  const available = parseFloat(liq.availableAmount ?? '0') / DECIMALS;
  const total = borrowed + available;
  const utilization = total > 0
    ? parseFloat(((borrowed / total) * 100).toFixed(2))
    : 0;

  const marketPrice = parseFloat(liq.marketPrice ?? '0');
  let tvl = total > 0 && marketPrice > 0
    ? Math.round(total * marketPrice)
    : 0;
  tvl = tvl / WADS;
  return {
    mintAddress,
    tvl,
    utilization,
    supplyAPY,
    borrowRate,
  };
}
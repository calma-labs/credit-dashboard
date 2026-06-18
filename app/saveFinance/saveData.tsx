import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

async function fetchMarketConfigs(): Promise<any[]> {
  const res = await fetch(
    "https://api.solend.fi/v1/markets/configs?scope=all",
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch Save market configs");
  return res.json();
}

const marketConfigs = await queryClient.fetchQuery({
  queryKey: ["saveMarketConfigs"],
  queryFn: fetchMarketConfigs,
  staleTime: 5 * 60 * 1000,
});

export async function getSaveData(): Promise<any[]> {
  // 1. Pobieramy główny rynek
  const mainMarket = marketConfigs.find(
    (m: any) => m.name === "Main" || m.isPrimary,
  );

  if (!mainMarket || !mainMarket.reserves) {
    console.warn("Main market not found in configs");
    return [];
  }

  // 2. Mapujemy adresy rezerw do pobrania z API
  const names: string = mainMarket.reserves
    .map((t: any) => t.address)
    .join(",");
  const reserves = await fetch(
    `https://api.solend.fi/v1/reserves?ids=${names}`,
    { cache: "no-store" },
  );

  if (!reserves.ok) {
    console.error(`Solend API Error: ${reserves.status}`);
    return [];
  }

  const JSON_reserves = await reserves.json();
  const results = JSON_reserves?.results ?? [];

  const standarizedSaveTokens = results.map((entry: any) => {
    const rates = entry.rates ?? {};
    const liq = entry.reserve?.liquidity ?? {};

    const reserveId = entry.reserve?.pubkey || entry.pubkey;

    const configReserve = mainMarket.reserves.find(
      (r: any) => r.address === reserveId,
    );

    const symbol = configReserve?.liquidityToken?.symbol ?? "UNKNOWN";

    const mintAddress = liq.mintPubkey;

    const supplyAPY = Number(
      parseFloat(rates.supplyInterest ?? "0").toFixed(2),
    );
    const borrowRate = Number(
      parseFloat(rates.borrowInterest ?? "0").toFixed(2),
    );

    const WADS = 1e18;
    const DECIMALS = Math.pow(10, liq.mintDecimals ?? 6);

    const borrowed =
      parseFloat(liq.borrowedAmountWads ?? "0") / WADS / DECIMALS;
    const available = parseFloat(liq.availableAmount ?? "0") / DECIMALS;
    const total = borrowed + available;

    const utilization =
      total > 0 ? parseFloat(((borrowed / total) * 100).toFixed(2)) : 0;

    const marketPrice = parseFloat(liq.marketPrice ?? "0");
    let tvl =
      total > 0 && marketPrice > 0 ? Math.round(total * marketPrice) : 0;

    tvl = tvl / WADS;

    return {
      symbol,
      mintAddress,
      tvl,
      utilization,
      supplyAPY,
      borrowRate,
      lending: "save Finance",
    };
  });

  return standarizedSaveTokens;
}

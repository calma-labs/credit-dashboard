import { QueryClient } from "@tanstack/react-query";
import { type StandarizedMetric } from "@/app/globalComponents/globalTypes";

const MORPHO_API = "https://api.morpho.org/graphql";

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
};

interface MorphoMarket {
  loanAsset: { symbol: string; address: string; decimals: number };
  chain: { id: number };
  state: {
    supplyAssetsUsd: number;
    utilization: number;
    supplyApy: number;
    borrowApy: number;
  };
}

const queryClient = new QueryClient();

async function fetchMorphoMarkets(): Promise<MorphoMarket[]> {
  const query = `
    query {
      markets(
        first: 100
        orderBy: SupplyAssetsUsd
        orderDirection: Desc
        where: { chainId_in: [1, 8453], listed: true }
      ) {
        items {
          loanAsset { address symbol decimals }
          chain { id }
          state {
            supplyAssetsUsd
            utilization
            supplyApy
            borrowApy
          }
        }
      }
    }
  `;

  const res = await fetch(MORPHO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Morpho API error: ${res.status}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "Morpho API returned errors");
  }

  return json?.data?.markets?.items ?? [];
}

export async function morphoStandarizedTokens(): Promise<StandarizedMetric[]> {
  const markets = await queryClient.fetchQuery({
    queryKey: ["morphoMarkets"],
    queryFn: fetchMorphoMarkets,
    staleTime: 5 * 60 * 1000,
  });

  const bySymbol = new Map<string, MorphoMarket>();
  for (const m of markets) {
    const symbol = m.loanAsset.symbol.toUpperCase();
    const existing = bySymbol.get(symbol);
    if (!existing || m.state.supplyAssetsUsd > existing.state.supplyAssetsUsd) {
      bySymbol.set(symbol, m);
    }
  }

  return Array.from(bySymbol.values())
    .filter((m) => m.state.supplyAssetsUsd > 1000)
    .map((m) => ({
      symbol: m.loanAsset.symbol.toUpperCase(),
      mintAddress: m.loanAsset.address,
      tvl: Number(m.state.supplyAssetsUsd.toFixed(2)),
      supplyAPY: Number((m.state.supplyApy * 100).toFixed(2)),
      utilization: Number((m.state.utilization * 100).toFixed(2)),
      borrowRate: Number((m.state.borrowApy * 100).toFixed(2)),
      borrowAPY: Number(((Math.exp(m.state.borrowApy) - 1) * 100).toFixed(2)),
      lending: "morpho",
      market: "morpho",
      chain: CHAIN_NAMES[m.chain.id] ?? `Chain ${m.chain.id}`,
    }));
}
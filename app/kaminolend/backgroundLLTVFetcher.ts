import { createSolanaRpc, address } from "@solana/kit";
import {
  KaminoMarket,
  getMarketsFromApi,
} from "@kamino-finance/klend-sdk";
import { RPC_URL } from "../juplend/hooks/useJupLendData";

const SLOT_DURATION_MS = 400;

// Cache for Kamino LLTV data to avoid repeated SDK loads
const lltvCache: Record<string, number> = {};

export async function fetchKaminoLLTVs(): Promise<Record<string, number>> {
  try {
    const rpc = createSolanaRpc(RPC_URL);
    const markets = await getMarketsFromApi();

    const loadedMarkets = await Promise.all(
      markets.map(async (config) => {
        try {
          const market = await KaminoMarket.load(
            rpc as Parameters<typeof KaminoMarket.load>[0],
            address(config.lendingMarket),
            SLOT_DURATION_MS,
            undefined,
            true,
          );
          return market;
        } catch (error) {
          return null;
        }
      }),
    );

    loadedMarkets
      .filter((market): market is KaminoMarket => market !== null)
      .flatMap((market) => market.getReserves())
      .forEach((reserve) => {
        if (reserve.stats.mintAddress && reserve.config.liquidationThreshold) {
          lltvCache[reserve.stats.mintAddress] = Number(reserve.config.liquidationThreshold) / 100;
        }
      });

    return lltvCache;
  } catch (error) {
    console.error("Error fetching Kamino LLTVs in background:", error);
    return {};
  }
}

export function getCachedLLTV(mintAddress: string): number | undefined {
  return lltvCache[mintAddress];
}

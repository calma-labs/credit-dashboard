import { BaseTokenFetcher } from "./BaseTokenFetcher";
import { TokenDataResult, TokenHistoryPoint, TokenSnapshot } from "./types";
import { type StandarizedMetric } from "../../../globalComponents/globalTypes";
import { symbolMatches, fetchJson } from "./utils";

const KAMINO_API = "https://api.kamino.finance";

interface KaminoMarketConfig {
  lendingMarket: string;
  name: string;
  isMainMarket?: boolean;
}

interface KaminoReserveMetric {
  reserve: string;
  liquidityToken: string;
  liquidityTokenMint: string;
  supplyApy: string;
  borrowApy: string;
  totalSupply: string;
  totalBorrow: string;
  totalSupplyUsd: string;
  totalBorrowUsd: string;
  maxLtv: string;
  liquidationLtv?: string; // LLTV / Liquidation Threshold
  liquidationThreshold?: string;
  marketName?: string;
  marketAddress?: string;
}

interface KaminoHistoryMetrics {
  supplyInterestAPY: number;
  borrowInterestAPY: number;
  depositTvl: string;
  borrowTvl: string;
}

interface KaminoHistoryEntry {
  timestamp: string;
  metrics: KaminoHistoryMetrics;
}

interface KaminoHistoryResponse {
  reserve: string;
  history: KaminoHistoryEntry[];
}

export class KaminoFetcher extends BaseTokenFetcher {
  private async fetchAllMarkets(): Promise<KaminoMarketConfig[]> {
    try {
      return await fetchJson<KaminoMarketConfig[]>(
        `${KAMINO_API}/v2/kamino-market`,
      );
    } catch (err) {
      console.error("[KaminoFetcher] Error fetching markets list:", err);
      return [];
    }
  }

  private async fetchReservesForMarket(
    market: KaminoMarketConfig,
  ): Promise<KaminoReserveMetric[]> {
    try {
      const reserves = await fetchJson<KaminoReserveMetric[]>(
        `${KAMINO_API}/kamino-market/${market.lendingMarket}/reserves/metrics`,
      );

      return reserves.map((r) => ({
        ...r,
        marketName: market.name || "isolated",
        marketAddress: market.lendingMarket,
      }));
    } catch (err) {
      console.error(
        `[KaminoFetcher] Error fetching metrics for market ${market.name}:`,
        err,
      );
      return [];
    }
  }

  private async fetchAllReserves(): Promise<KaminoReserveMetric[]> {
    const markets = await this.fetchAllMarkets();

    if (markets.length === 0) {
      return [];
    }

    const marketReservesResults = await Promise.all(
      markets.map((market) => this.fetchReservesForMarket(market)),
    );

    return marketReservesResults.flat();
  }

  async fetchMetrics(): Promise<StandarizedMetric[]> {
    try {
      const reserves = await this.fetchAllReserves();

      return reserves
        .map((r) => {
          // LTV (Max Loan to Value)
          const maxLTVValue = parseFloat(r.maxLtv);
          // LLTV (Liquidation LTV / Liquidation Threshold)
          const lltvValue = parseFloat(
            r.liquidationLtv || r.liquidationThreshold || "0",
          );

          const totalSupply = parseFloat(r.totalSupply || "0");
          const totalBorrow = parseFloat(r.totalBorrow || "0");

          return {
            symbol: r.liquidityToken,
            mintAddress: r.liquidityTokenMint,
            tvl: parseFloat(r.totalSupplyUsd || "0"),
            utilization: parseFloat(
              (totalSupply > 0 ? (totalBorrow / totalSupply) * 100 : 0).toFixed(
                2,
              ),
            ),
            supplyAPY: parseFloat(
              (parseFloat(r.supplyApy || "0") * 100).toFixed(2),
            ),
            borrowRate: parseFloat(
              (parseFloat(r.borrowApy || "0") * 100).toFixed(2),
            ),
            borrowAPY: parseFloat(
              (parseFloat(r.borrowApy || "0") * 100).toFixed(2),
            ),
            lending: "kamino",
            market: r.marketName ?? "main",
            chain: "Solana",
            maxLTV: parseFloat((maxLTVValue * 100).toFixed(2)),
            lltv: parseFloat((lltvValue * 100).toFixed(2)),
          };
        })
        .filter((metric) => !isNaN(metric.utilization));
    } catch (err) {
      console.error("[KaminoFetcher] Error fetching metrics:", err);
      return [];
    }
  }

  async fetch(
    platform: string,
    asset: string,
    collateral?: string,
  ): Promise<TokenDataResult | null> {
    const reserves = await this.fetchAllReserves();

    const candidates = reserves
      .filter((r) => symbolMatches(r.liquidityToken, asset))
      .sort(
        (a, b) =>
          parseFloat(b.totalSupplyUsd || "0") -
          parseFloat(a.totalSupplyUsd || "0"),
      );

    const bestReserve = candidates[0];
    if (!bestReserve) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const start = now - 400 * 24 * 60 * 60;

    let history: TokenHistoryPoint[] = [];
    try {
      const marketAddress = bestReserve.marketAddress;
      const historyJson = await fetchJson<KaminoHistoryResponse>(
        `${KAMINO_API}/kamino-market/${marketAddress}/reserves/${bestReserve.reserve}/metrics/history` +
          `?env=mainnet-beta&frequency=day&start=${start}&end=${now}`,
      );
      const entries = historyJson.history ?? [];

      history = entries
        .filter(
          (e) => e.timestamp && e.metrics?.supplyInterestAPY !== undefined,
        )
        .map((e) => {
          const depositTvl = parseFloat(e.metrics.depositTvl || "0");
          const borrowTvl = parseFloat(e.metrics.borrowTvl || "0");
          const utilization =
            depositTvl > 0 ? (borrowTvl / depositTvl) * 100 : 0;

          return {
            date: e.timestamp,
            apy: parseFloat((e.metrics.supplyInterestAPY * 100).toFixed(2)),
            utilization: parseFloat(utilization.toFixed(2)),
          };
        });
    } catch {
      // history unavailable; snapshot-only result below
    }

    const totalSupply = parseFloat(bestReserve.totalSupply || "0");
    const totalBorrow = parseFloat(bestReserve.totalBorrow || "0");
    const utilization = totalSupply > 0 ? (totalBorrow / totalSupply) * 100 : 0;

    const snapshot: TokenSnapshot = {
      tvl: Math.round(parseFloat(bestReserve.totalSupplyUsd || "0")),
      supplyAPY: parseFloat(
        (parseFloat(bestReserve.supplyApy || "0") * 100).toFixed(2),
      ),
      borrowRate: parseFloat(
        (parseFloat(bestReserve.borrowApy || "0") * 100).toFixed(2),
      ),
      utilization: parseFloat(utilization.toFixed(2)),
    };

    return {
      history,
      poolId: bestReserve.reserve,
      source: "kamino",
      matchedSymbol: bestReserve.liquidityToken,
      snapshot,
    };
  }
}

import { createSolanaRpc, address } from "@solana/kit";
import {
  KaminoMarket,
  KaminoReserve,
  getMarketsFromApi,
} from "@kamino-finance/klend-sdk";
import { Connection } from "@solana/web3.js";
import { RPC_URL } from "../juplend/hooks/useJupLendData";
import { type StandarizedMetric } from "../globalComponents/globalTypes";

const SLOT_DURATION_MS = 400;

//kamino's metrics calculations
function kaminoTVL(token: KaminoReserve): number {
  return Number(token.getDepositTvl().toFixed(2));
}
function kaminoUtilization(token: KaminoReserve): number {
  return Number((token.calculateUtilizationRatio() * 100).toFixed(2));
}
function kaminoBorrowRate(token: KaminoReserve, slot: number): number {
  return Number(
    (
      token.calculateBorrowAPR(
        BigInt(slot),
        Math.floor(token.calculateUtilizationRatio() * 10000),
      ) * 100
    ).toFixed(2),
  );
}
function kaminoSupplyAPY(token: KaminoReserve, slot: number): number {
  return Number((token.totalSupplyAPY(BigInt(slot)) * 100).toFixed(2));
}
function kaminoBorrowAPY(token: KaminoReserve, slot: number): number {
  return Number(
    ((Math.exp(kaminoBorrowRate(token, slot) / 100) - 1) * 100).toFixed(2),
  );
}
//fetching every token
export async function fetchReserves(): Promise<KaminoReserve[]> {
  const rpc = createSolanaRpc(RPC_URL);
  const markets = await getMarketsFromApi();

  const results = await Promise.all(
    markets.map((config) =>
      KaminoMarket.load(
        rpc as Parameters<typeof KaminoMarket.load>[0],
        address(config.lendingMarket),
        SLOT_DURATION_MS,
        undefined,
        true,
      ),
    ),
  );

  return results
    .flatMap((market) => market?.getReserves() ?? [])
    .filter((reserve) => reserve.getBorrowedAmount().gt(0));
}

//getting the slot for APYs
export async function getSlotForAPY() {
  const CONNECTION = new Connection(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
  );
  const SLOT = await CONNECTION.getSlot();

  return SLOT;
}

//standarizing tokens
export async function kaminoStandarizedTokens(): Promise<StandarizedMetric[]> {
  //rpc
  const rpc = createSolanaRpc(RPC_URL);

  //fetching markets
  const markets = await getMarketsFromApi();

  //getting the slot
  const getKaminoSlot = await getSlotForAPY();

  //array with results
  let result: StandarizedMetric[] = [];

  for (const config of markets) {
    const market = await KaminoMarket.load(
      rpc as Parameters<typeof KaminoMarket.load>[0],
      address(config.lendingMarket),
      SLOT_DURATION_MS,
      undefined,
      true,
    );

    //flag
    if (!market) continue;

    const marketName = config.name ?? "isolated";

    market.getReserves().forEach((t) => {
      result.push({
        symbol: t.symbol ?? "Unavailable",
        mintAddress: t.stats.mintAddress ?? "Unavailable",
        tvl: kaminoTVL(t) ?? 0,
        utilization: kaminoUtilization(t) ?? 0,
        supplyAPY: kaminoSupplyAPY(t, getKaminoSlot) ?? 0,
        borrowRate: kaminoBorrowRate(t, getKaminoSlot) ?? 0,
        borrowAPY: kaminoBorrowAPY(t, getKaminoSlot) ?? 0,
        lending: `kamino`,
        market: marketName,
      });
    });
  }

  return result;
}

import { PublicKey } from "@solana/web3.js";
import { type StandarizedMetric } from "@/app/globalComponents/globalTypes";

export const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;
const API_BASE = "https://lite-api.jup.ag/lend/v1";

export let new_error = false;

interface ApiToken {
  id: number;
  address: string;
  symbol: string;
  decimals: number;
  assetAddress: string;
  asset: { symbol: string; price: string; logoUrl?: string };
  totalAssets: string;
  supplyRate: string;
  rewardsRate: string;
  totalRate: string;
}

interface BorrowVault {
  id: number;
  address: string;
  supplyToken: {
    address: string;
    symbol: string;
    uiSymbol: string;
    decimals: number;
    price: string;
  };
  borrowToken: {
    address: string;
    symbol: string;
    uiSymbol: string;
    decimals: number;
    price: string;
  };
  totalSupply: string;
  totalBorrow: string;
  collateralFactor: number;
  liquidationThreshold: number;
  supplyRate: number;
  borrowRate: number;
  totalPositions: number;
}

export interface TokenData {
  symbol: string;
  mint: string;
  decimals: number;
  apr: number;
  supplyRate: number;
  rewardsRate: number;
  borrowRate: number;
  utilization: number;
  tvlUsd: number;
  totalAssets: number;
}

export interface JupLendData {
  tokens: TokenData[];
  loading: boolean;
  error: string | null;
}

const LIQUIDITY_PROGRAM = new PublicKey(
  "jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC",
);

function tokenReservePDA(mint: PublicKey): PublicKey {
  const enc = new TextEncoder();
  const [pda] = PublicKey.findProgramAddressSync(
    [enc.encode("reserve"), mint.toBytes()],
    LIQUIDITY_PROGRAM,
  );
  return pda;
}

async function fetchTokenReserve(
  mint: PublicKey,
): Promise<{ borrowRate: number; utilization: number } | null> {
  try {
    const pda = tokenReservePDA(mint);
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [pda.toString(), { encoding: "base64" }],
    });

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) {
      new_error = true;
      return null;
    }

    const json = await res.json();
    const b64 = json?.result?.value?.data?.[0];
    if (!b64) {
      new_error = true;
      return null;
    }

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (bytes.length < 78) {
      new_error = true;
      return null;
    }

    const view = new DataView(bytes.buffer);
    const borrowRate = view.getUint16(72, true) / 100;
    const utilization = view.getUint16(76, true) / 100;

    return { borrowRate, utilization };
  } catch {
    new_error = true;
    return null;
  }
}

export async function useJupLendData(): Promise<JupLendData> {
  try {
    const res = await fetch(`${API_BASE}/earn/tokens`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const apiTokens: ApiToken[] = await res.json();

    const tokens: TokenData[] = await Promise.all(
      apiTokens.map(async (t) => {
        const mint = new PublicKey(t.assetAddress);
        const reserve = await fetchTokenReserve(mint);

        const price = parseFloat(t.asset.price) || 0;
        const totalAssets = Number(t.totalAssets) / Math.pow(10, t.decimals);

        return {
          symbol: t.asset.symbol,
          mint: t.assetAddress,
          decimals: t.decimals,
          apr: Number(t.totalRate) / 10000,
          supplyRate: Number(t.supplyRate) / 100,
          rewardsRate: Number(t.rewardsRate) / 100,
          borrowRate: reserve?.borrowRate ?? 0,
          utilization: reserve?.utilization ?? 0,
          tvlUsd: totalAssets * price,
          totalAssets,
        };
      }),
    );

    return {
      tokens: tokens.filter((t) => t.tvlUsd > 100000),
      loading: false,
      error: null,
    };
  } catch (e) {
    return {
      tokens: [],
      loading: false,
      error: e instanceof Error ? e.message : "Błąd pobierania danych",
    };
  }
}

async function fetchBorrowVaults(): Promise<BorrowVault[]> {
  try {
    const res = await fetch(`${API_BASE}/borrow/vaults`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function standarizedJupLendToken(): Promise<StandarizedMetric[]> {
  const vaults = await fetchBorrowVaults();

  if (vaults.length > 0) {
    return vaults
      .filter((v) => {
        const supplyPrice = parseFloat(v.supplyToken.price) || 0;
        const supplyUsd =
          (Number(v.totalSupply) / Math.pow(10, v.supplyToken.decimals)) *
          supplyPrice;
        return supplyUsd > 100000;
      })
      .map((v) => {
        const borrowPrice = parseFloat(v.borrowToken.price) || 0;
        const supplyPrice = parseFloat(v.supplyToken.price) || 0;
        const tvlUsd =
          (Number(v.totalSupply) / Math.pow(10, v.supplyToken.decimals)) *
          supplyPrice;
        const borrowUsd =
          (Number(v.totalBorrow) / Math.pow(10, v.borrowToken.decimals)) *
          borrowPrice;
        const utilization =
          tvlUsd > 0 ? Number(((borrowUsd / tvlUsd) * 100).toFixed(2)) : 0;

        const supplyAPY = Number((v.supplyRate / 100).toFixed(2));
        const borrowAPY = Number((v.borrowRate / 100).toFixed(2));
        const maxLTV = Number(((v.collateralFactor / 1000) * 100).toFixed(2));
        const lltv = Number(((v.liquidationThreshold / 1000) * 100).toFixed(2));

        return {
          symbol: v.borrowToken.uiSymbol.toUpperCase(),
          mintAddress: v.borrowToken.address,
          tvl: Number(tvlUsd.toFixed(2)),
          supplyAPY,
          utilization,
          borrowRate: borrowAPY,
          borrowAPY,
          lending: "jupiter",
          market: "jupiter",
          chain: "Solana",
          collateral: v.supplyToken.uiSymbol.toUpperCase(),
          maxLTV,
          lltv,
          liqThreshold: lltv,
        };
      });
  }

  const JUPLEND_DATA = await useJupLendData();
  return JUPLEND_DATA.tokens.map((t) => {
    const apy = Math.pow(1 + t.apr / 365, 365) - 1;
    return {
      symbol: t.symbol.toUpperCase(),
      mintAddress: t.mint,
      tvl: Number(t.tvlUsd),
      supplyAPY: Number((apy * 100).toFixed(2)),
      utilization: Number(t.utilization.toFixed(2)),
      borrowRate: Number(t.borrowRate.toFixed(2)),
      lending: "jupiter",
      market: "jupiter",
      borrowAPY: Number(((Math.exp(t.borrowRate / 100) - 1) * 100).toFixed(2)),
      chain: "Solana",
    };
  });
}

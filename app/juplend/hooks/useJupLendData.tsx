import { PublicKey } from '@solana/web3.js';

// Zmiana z import.meta.env na process.env
const RPC_PROXY = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;
const API_BASE = 'https://lite-api.jup.ag/lend/v1';
const LIQUIDITY_PROGRAM = new PublicKey('jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC');

async function getErr(error: any): Promise<any> {
  return error;
}

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

export interface TokenData {
  symbol: string;
  mint: string;
  decimals: number;
  apy: number;
  supplyRate: number;
  rewardsRate: number;
  borrowRate: number;
  utilization: number;
  tvlUsd: number;
  totalAssets: number;
}

export type Period = '7d' | '1m' | '1y';

export interface ChartPoint {
  date: string;
  yield: number;
}

export interface JupLendData {
  tokens: TokenData[];
  loading: boolean;
  error: string | null;
}

export function generateMockHistory(currentApy: number, period: Period): ChartPoint[] {
  const now = Date.now();

  const noise = (i: number) => {
    const x = Math.sin(currentApy * 12.9898 + i * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  };

  if (period === '7d') {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * 86400000);
      const val = Math.max(0, currentApy + noise(i) * currentApy * 0.05);
      return { date: date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }), yield: +val.toFixed(4) };
    });
  }

  if (period === '1m') {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now - (29 - i) * 86400000);
      const val = Math.max(0, currentApy * (0.7 + 0.3 * (i / 29)) + noise(i) * currentApy * 0.04);
      return { date: date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }), yield: +val.toFixed(4) };
    });
  }

  return Array.from({ length: 52 }, (_, i) => {
    const date = new Date(now - (51 - i) * 7 * 86400000);
    const val = Math.max(0, currentApy * (i / 51) + noise(i) * currentApy * 0.06);
    return { date: date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }), yield: +val.toFixed(4) };
  });
}

function tokenReservePDA(mint: PublicKey): PublicKey {
  const enc = new TextEncoder();
  const [pda] = PublicKey.findProgramAddressSync(
    [enc.encode('reserve'), mint.toBytes()],
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
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [pda.toString(), { encoding: 'base64' }],
    });

    const res = await fetch(RPC_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok){
      new_error = true;
      return null;
    }
    
    const json = await res.json();
    const b64 = json?.result?.value?.data?.[0];
    if (!b64){
      new_error = true;
      return null;
    }

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (bytes.length < 78){
      new_error = true;
      return null;
    }

    const view = new DataView(bytes.buffer);
    
    const borrowRate = view.getUint16(72, true) / 100;
    const utilization = view.getUint16(76, true) / 100;

    return { borrowRate, utilization };
  } catch (e){
    new_error = true;
    return null;
  }
}

// Funkcja asynchroniczna zwracająca dokładnie strukturę JupLendData
export async function useJupLendData(): Promise<JupLendData> {
  
  try {
    const res = await fetch(`${API_BASE}/earn/tokens`, {
      cache: 'no-store', // Wymuszenie świeżych danych przy każdym zapytaniu serwera
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
          apy: Number(t.totalRate) / 100,
          supplyRate: Number(t.supplyRate) / 100,
          rewardsRate: Number(t.rewardsRate) / 100,
          borrowRate: reserve?.borrowRate ?? 0,
          utilization: reserve?.utilization ?? 0,
          tvlUsd: totalAssets * price,
          totalAssets,
        };
      }),
    );

    // Zwraca sukces dokładnie w takim formacie, jaki był w setData
    return {
      tokens: tokens.filter((t) => t.totalAssets > 0),
      loading: false,
      error: null,
    };
  } catch (e: any) {
    // Zwraca błąd w formacie zgodnym z pierwotnym blokiem catch
    return {
      tokens: [],
      loading: false,
      error: e.message ?? 'Błąd pobierania danych',
    };
  }
}
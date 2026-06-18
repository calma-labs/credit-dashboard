import { PublicKey } from '@solana/web3.js';
import { type StandarizedMetric } from '@/app/globalComponents/globalTypes';

// Zmiana z import.meta.env na process.env
export const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;
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

export interface JupLendData {
  tokens: TokenData[];
  loading: boolean;
  error: string | null;
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

    const res = await fetch(RPC_URL, {
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

//standarizing the jupLend data
export async function standarizedJupLendToken(): Promise<StandarizedMetric[]>{
  
  //using the juplend data
  const JUPLEND_DATA  =   await useJupLendData();

  //standarized metrics list
  let standarizedJupLend: StandarizedMetric[] = [];

  //mapping juplend's token to make comparison easier
  JUPLEND_DATA.tokens.map((t =>{

    standarizedJupLend.push
    ({

      symbol: 	    t.symbol,
	    mintAddress:  t.mint,
      tvl:          Number(t.tvlUsd),
      supplyAPY:    Number(t.apy.toFixed(2)),
      utilization:  Number(t.utilization.toFixed(2)),
      borrowRate:   Number(t.borrowRate.toFixed(2)),
      lending:      "juplend",
    })

  }))
  
  //result list
  return standarizedJupLend;
}
import { Connection, PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder, type Idl } from "@coral-xyz/anchor";
import bs58 from 'bs58';

import rawIdl from './klend.json';

export const idl: Idl = rawIdl as Idl;
const KLEND_KEY = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const RPC = 'https://api.mainnet-beta.solana.com';
const new_connection = new Connection(RPC, 'confirmed');
const coder = new BorshAccountsCoder(idl);
const acc_discriminator = BorshAccountsCoder.accountDiscriminator('Reserve');

type ReserveMetrics = {
  pubkey: string;
  version: number;
  lastUpdate: any;
  lendingMarket: string;
  utilizationPct: number;
  borrowApyPct: number;
  supplyApyPct: number;
  tvlTokens: number;
  liquidity: {
    mintPubkey: string;
    mintDecimals: number;
    availableAmount: string;
    borrowedAmountSf: string;
  };
  collateral: {
    mintPubkey: string;
    mintDecimals: number;
    totalSupply: string;
  };
};

function safeString(value: unknown, fallback = '0'): string {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof (value as any).toString === 'function') {
    const stringValue = (value as any).toString();
    return stringValue === '' ? fallback : stringValue;
  }
  return fallback;
}

function safeBigInt(value: unknown): bigint {
  if (value == null) return BigInt(0);
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof (value as any).toString === 'function') {
    const stringValue = (value as any).toString();
    return stringValue === '' ? BigInt(0) : BigInt(stringValue);
  }
  return BigInt(0);
}

function safeBase58(value: any): string {
  return value && typeof value.toBase58 === 'function' ? value.toBase58() : '';
}

function getUtilizationPct(liquidity: any): number {
  const borrowed = safeBigInt(liquidity.borrowedAmountSf);
  const available = safeBigInt(liquidity.availableAmount);
  const total = borrowed + available;
  if (total === BigInt(0)) return 0;
  return Number((borrowed * BigInt(10000)) / total) / 100;
}

function getBorrowRateBps(utilizationPct: number, curve: any): number {
  type BorrowCurvePoint = {
    utilBps: number;
    rateBps: number;
  };

  const points: BorrowCurvePoint[] = Array.isArray(curve?.points)
    ? curve.points.map((point: any) => ({
        utilBps: Number(point.utilizationRateBps),
        rateBps: Number(point.borrowRateBps),
      }))
    : [];

  if (points.length === 0) return 0;
  const sorted = points.slice().sort((a, b) => a.utilBps - b.utilBps);
  const utilBps = Math.round(utilizationPct * 100);

  if (utilBps <= sorted[0].utilBps) {
    return sorted[0].rateBps;
  }

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (utilBps <= next.utilBps) {
      const slope = (next.rateBps - current.rateBps) / (next.utilBps - current.utilBps);
      return current.rateBps + slope * (utilBps - current.utilBps);
    }
  }

  return sorted[sorted.length - 1].rateBps;
}

function getBorrowApyPct(reserve: any): number {
  const utilPct = getUtilizationPct(reserve.liquidity);
  return getBorrowRateBps(utilPct, reserve.config.borrowRateCurve) / 100;
}

function getSupplyRatePct(reserve: any): number {
  const utilPct = getUtilizationPct(reserve.liquidity);
  const borrowRateBps = getBorrowRateBps(utilPct, reserve.config.borrowRateCurve);
  const protocolTakePct = Number(reserve.config.protocolTakeRatePct ?? 0);
  const supplyRateBps = borrowRateBps * utilPct / 100 * (1 - protocolTakePct / 100);
  return supplyRateBps / 100;
}

function getTvlTokens(reserve: any): number {
  const borrowed = safeBigInt(reserve.liquidity.borrowedAmountSf);
  const available = safeBigInt(reserve.liquidity.availableAmount);
  const total = borrowed + available;
  const decimals = Number(reserve.liquidity.mintDecimals ?? 0);
  return Number(total) / 10 ** decimals;
}

async function fetchReserves(): Promise<ReserveMetrics[]> {
  const fetched_reserve = await new_connection.getProgramAccounts(KLEND_KEY, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(acc_discriminator),
        },
      },
    ],
  });

  return fetched_reserve.flatMap(({ pubkey, account }) => {
    try {
      const decoded_reserve = coder.decode('Reserve', account.data);
      const utilizationPct = getUtilizationPct(decoded_reserve.liquidity);
      const borrowApyPct = getBorrowApyPct(decoded_reserve);
      const supplyApyPct = getSupplyRatePct(decoded_reserve);
      const tvlTokens = getTvlTokens(decoded_reserve);

      return [{
        pubkey: safeBase58(pubkey),
        version: Number(decoded_reserve.version ?? 0),
        lastUpdate: decoded_reserve.lastUpdate,
        lendingMarket: safeBase58(decoded_reserve.lendingMarket),
        utilizationPct,
        borrowApyPct,
        supplyApyPct,
        tvlTokens,
        liquidity: {
          mintPubkey: safeBase58(decoded_reserve.liquidity.mintPubkey),
          mintDecimals: Number(decoded_reserve.liquidity.mintDecimals ?? 0),
          availableAmount: safeString(decoded_reserve.liquidity.availableAmount, '0'),
          borrowedAmountSf: safeString(decoded_reserve.liquidity.borrowedAmountSf, '0'),
        },
        collateral: {
          mintPubkey: safeBase58(decoded_reserve.collateral.mintPubkey),
          mintDecimals: Number(decoded_reserve.collateral.mintDecimals ?? 0),
          totalSupply: safeString(decoded_reserve.collateral.totalSupply, '0'),
        },
      }];
    } catch (error) {
      console.error('Decode reserve error', error);
      return [];
    }
  });
}

async function App() {
  const accs = await fetchReserves();

  return (
    <div>
      <h1><i>Kamino Lending Scrap</i></h1>
      <div>
        <button>7 D</button>
        <button>1 M</button>
        <button>1 Y</button>
      </div>
      {accs.length === 0 ? (
        <p>No reserves found.</p>
      ) : (
        <div>
          {accs.map((reserve) => (
            <div key={reserve.pubkey} style={{ marginTop: 20, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
              <h2>Reserve {reserve.pubkey.slice(0, 10)}...</h2>
              <p>Version: {reserve.version}</p>
              <p>Market: {reserve.lendingMarket}</p>
              <p>Utilization: {reserve.utilizationPct.toFixed(2)}%</p>
              <p>Borrow APY: {reserve.borrowApyPct.toFixed(2)}%</p>
              <p>Supply APY: {reserve.supplyApyPct.toFixed(2)}%</p>
              <p>TVL: {reserve.tvlTokens.toFixed(4)} tokens</p>
              <p>Liquidity mint: {reserve.liquidity.mintPubkey}</p>
              <p>Available: {reserve.liquidity.availableAmount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

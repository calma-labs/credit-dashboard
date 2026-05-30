import { Connection, PublicKey,type GetProgramAccountsResponse  } from "@solana/web3.js";
import { BorshAccountsCoder,type Idl, type ProgramAccount } from "@coral-xyz/anchor";
import bs58 from 'bs58';

import rawIdl from './klend.json'

export const idl: Idl = rawIdl as Idl;
const KLEND_KEY = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const RPC = 'https://api.mainnet-beta.solana.com';

const new_connection = new Connection(RPC, 'confirmed');
const coder = new BorshAccountsCoder(idl);
const acc_discriminator = BorshAccountsCoder.accountDiscriminator('Reserve');

function bnToBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (value && typeof (value as any).toString === 'function') return BigInt((value as any).toString());
  throw new Error('Unable to convert value to bigint');
}

function getUtilizationPct(liquidity: any): number {
  const borrowed = bnToBigInt(liquidity.borrowedAmountSf);
  const available = bnToBigInt(liquidity.availableAmount);
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

function getSupplyRatePct(reserve: any): number {
  const utilPct = getUtilizationPct(reserve.liquidity);
  const borrowRateBps = getBorrowRateBps(utilPct, reserve.config.borrowRateCurve);
  const protocolTakePct = Number(reserve.config.protocolTakeRatePct ?? 0);
  const supplyRateBps = borrowRateBps * utilPct / 100 * (1 - protocolTakePct / 100);
  return supplyRateBps / 100;
}

function getTvlTokens(reserve: any): number {
  const borrowed = bnToBigInt(reserve.liquidity.borrowedAmountSf);
  const available = bnToBigInt(reserve.liquidity.availableAmount);
  const total = borrowed + available;
  const decimals = Number(reserve.liquidity.mintDecimals ?? 0);
  return Number(total) / 10 ** decimals;
}

async function App() {

    async function fetch_data(){
      try{
        const fetched_reserve = await new_connection.getProgramAccounts(KLEND_KEY,
          {
            filters:
          [
            {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(acc_discriminator)
            },
            }
          ]});
          
          console.log(fetched_reserve);
          return fetched_reserve;
      }catch(e){
        console.log(e)
      }

    // for (const { account } of accs) {
    //   try{
    //     const decoded_reserve = coder.decode('Reserve', account.data);
    //     pool.push({
    //     ...
    //    })
    //    console.log('Pool fetched correctly!');
    //   }catch(e){
    //     console.log('Pool fetching caused an error {', e,'}');
    //   }
    // } -> pool, odczytanie danych bezpośrednio  
    }
    
    const accs = await fetch_data();
    console.log('Fetching data from the blockchain...', accs);
      
  return (
    <div>
      <h1><i>Kamino Lending Scrap</i></h1>
      <button>7 D</button>
      <button>1 M</button>
      <button>1 Y</button>
    </div>
    //wykresy
  );
}

export default App

import { Connection, PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder, type Idl } from "@coral-xyz/anchor";
import { KaminoMarket } from "@kamino-finance/klend-sdk";
import bs58 from 'bs58';

import rawIdl from './klend.json';
import ReserveCharts from './ReserveCharts';


const IDL = rawIdl as Idl;
const KLEND_KEY = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const RPC = 'https://api.mainnet-beta.solana.com';
const CONNECTION = new Connection(RPC, 'confirmed');
const CODER = new BorshAccountsCoder(IDL);
const ACC_DISCRIMINATOR = BorshAccountsCoder.accountDiscriminator('Reserve');

type mask = {
  pubkey: string;
  liquidity: {
    mintPubkey: string;
    mintDecimals: BigInt;
    availableAmount: BigInt;
    borrowedAmountSf: BigInt;
  },
  metrics: {
    total: number;
    borrowed: number;
    available: number;
    utilization: number;
    tvl: number;
  },
};

//CALCULATION FUNCTIONS 

function borrowed(borrowed: BigInt): number{
  return Number(borrowed) / (2**60);
}

function available(raw: BigInt, decimals: BigInt): number{
  console.log(Number(raw))
  return Number(raw) / (10 ** Number(decimals));
}

function utilization(borrowed: number, available: number): number{
  return borrowed / (borrowed + available);
}

function tvl(borrowed: number, available: number, price: number): number{
  return (borrowed + available) * price;
}


const fetchReserves = async (): Promise<mask[]> =>{
  const FETCHED_RESERVES = await CONNECTION.getProgramAccounts(KLEND_KEY, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(ACC_DISCRIMINATOR),
        },
      },
    ],
  });


  return FETCHED_RESERVES.flatMap(({ pubkey, account }) => {
    try{
      const DECODED_RESERVE = CODER.decode('Reserve', account.data);

      if (DECODED_RESERVE.liquidity.borrowedAmountSf?.toString() === '0') {
        return [];
      }

      const RESERVE_AVAILABLE = available(DECODED_RESERVE.liquidity.availableAmount ?? 0, DECODED_RESERVE.liquidity.mintDecimals ?? 0);
      const RESERVE_BORROWED = borrowed(DECODED_RESERVE.liquidity.borrowedAmountSf ?? 0);
      const RESERVE_DECIMALS = DECODED_RESERVE.liquidity.mintDecimals ?? 0;

      console.log(DECODED_RESERVE);

      return [
        {
          pubkey: pubkey.toBase58(),
          liquidity: {
            mintPubkey: DECODED_RESERVE.liquidity.mintPubkey.toBase58(),
            mintDecimals: BigInt(String(DECODED_RESERVE.liquidity.mintDecimals ?? 0)),
            availableAmount: BigInt(String(DECODED_RESERVE.liquidity.availableAmount ?? 0)),
            borrowedAmountSf: BigInt(String(DECODED_RESERVE.liquidity.borrowedAmountSf ?? 0)),
          },
          metrics: {
            total: RESERVE_AVAILABLE + RESERVE_BORROWED,
            borrowed: RESERVE_BORROWED,
            available: RESERVE_AVAILABLE,
            utilization: utilization(RESERVE_BORROWED, RESERVE_AVAILABLE),
            tvl: tvl(RESERVE_BORROWED, RESERVE_AVAILABLE, RESERVE_DECIMALS ), //<<< docelowo zamiast decimals ma być price
          },
    }];
    }catch(error){
      console.error('Decode reserve error', error);
      return [];
    }
  });
  }

export default async function App(){
  const FETCHED_RESERVES = await fetchReserves();
  console.log(FETCHED_RESERVES);
  return (
    <div>
      {FETCHED_RESERVES.map((reserve) => (

        <div key={reserve.pubkey}>
          <h2>Reserve {reserve.pubkey}</h2>
          <p>Available Amount: {Number(reserve.liquidity.availableAmount)}</p>
          <p>Available Amount: {reserve.metrics.available}</p>
          <p>Borrowed Amount: {reserve.metrics.borrowed}</p>
          <p>Utilization: {reserve.metrics.utilization}</p>
        </div>

      ))}
    </div>
  );
}
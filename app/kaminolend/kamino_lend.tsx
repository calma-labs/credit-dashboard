import { createSolanaRpc, address } from '@solana/kit';
import { KaminoMarket, KaminoReserve, getMarketsFromApi } from '@kamino-finance/klend-sdk';
import { Connection } from '@solana/web3.js';
import { RPC_URL } from '../juplend/hooks/useJupLendData';

const SLOT_DURATION_MS = 400;

//standarized metric's type 
type standarizedMetric = {
  symbol:       string,
  mintAddress:   string,
  tvl:          number,
  utilization:  number,
  supplyAPY:    number,
  borrowRate:   number,   
}

//kamino's metrics calculations
function kaminoTVL(token: KaminoReserve):                     number{

  return Number(token.getDepositTvl().toFixed(2));

}
function kaminoUtilization(token: KaminoReserve):             number{

  return Number((token.calculateUtilizationRatio() * 100).toFixed(2));

}
function kaminoBorrowRate(token: KaminoReserve, slot: number):number{
  
  return Number((token.calculateBorrowAPR(BigInt(slot), Math.floor(token.calculateUtilizationRatio() * 10000)) * 100).toFixed(2));

}
function kaminoSupplyAPY(token: KaminoReserve, slot: number): number{
 
  return Number((token.totalSupplyAPY(BigInt(slot)) * 100).toFixed(2))

}

//fetching every token 
export async function fetchReserves(): Promise<KaminoReserve[]> {

  const rpc = createSolanaRpc(RPC_URL);
  const markets = await getMarketsFromApi();

  const results = await Promise.all(
    markets.slice(0, 2).map((config) =>
      KaminoMarket.load(
        rpc as Parameters<typeof KaminoMarket.load>[0],
        address(config.lendingMarket),
        SLOT_DURATION_MS,
        undefined,
        true
      )
    )
  );

  return results
    .flatMap((market) => market?.getReserves() ?? [])
    .filter((reserve) => reserve.getBorrowedAmount().gt(0));
}

//getting the slot for APYs
export async function getSlotForAPY(){

  const CONNECTION = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`);
  const SLOT = await CONNECTION.getSlot();

  return SLOT;

}

//standarizing tokens 
export async function kaminoStandarizedTokens(): Promise<standarizedMetric[]>{

  //fetching tokens
  const KAMINO_TOKENS:KaminoReserve[] = await fetchReserves(); 

  //getting the slot
  const GET_KAMINO_SLOT = await getSlotForAPY();

  //array with results
  let result:standarizedMetric[] = [];

  //mapping each token's metrics
  KAMINO_TOKENS.map((t =>{

    //pushing results to array
    result.push
      ({

        //... with following type [standarizedMetric]
        symbol:       t.symbol,
        mintAddress:   t.stats.mintAddress,
        tvl:          kaminoTVL(t),
        utilization:  kaminoUtilization(t),
        supplyAPY:    kaminoSupplyAPY(t, GET_KAMINO_SLOT),
        borrowRate:   kaminoBorrowRate(t, GET_KAMINO_SLOT),
      
      });
  
  }))

  return result;
}

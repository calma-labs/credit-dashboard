//imports 
import { fetchReserves, getSlotForAPY, kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { useJupLendData, new_error } from './juplend/hooks/useJupLendData';
import { KaminoReserve } from '@kamino-finance/klend-sdk';

//metric's type
type MatchedTokens = {
  
  //symbol of matching tokens
  symbol: string;

  //kamino's side object
  kaminoLeftSide: {
    mintAddress:  string,
    tvl:          number,
    supplyAPY:    number;
    utilization:  number,
    borrowRate:   number,
  }

  //juplend's side object
  juplendRightSide: {
    mintAddress:  string,
    tvl:          number,
    supplyAPY:    number,
    utilization:  number,
    borrowRate:   number,
  }

}

//result of comparision
let comparisonResults: MatchedTokens[] = [];

//data fetch from each lending
const LEFT_SIDE_LENDING =     await fetchReserves();
const RIGHT_SIDE_LENDING =    await useJupLendData();

//main function 
export default async function App() 
{

  //error hanlder 
  if(
    LEFT_SIDE_LENDING.length          === 0   ||  //0 is equal to non existing list
    RIGHT_SIDE_LENDING.tokens.length  === 0       //0 is equal to non existing list
  ) 
  {
    return (<div>Loading...</div>);
  }

  //filtering by symbol
  const FILTERED_BY_SYMBOL = LEFT_SIDE_LENDING.filter
  (

    leftSideToken => 
      RIGHT_SIDE_LENDING.tokens.some(

      rightSideToken => 
      rightSideToken.symbol  === leftSideToken.symbol           &&  //filtering by same symbol
      rightSideToken.mint    === leftSideToken.stats.mintAddress    //filtering by same mint 

    )

  );

  
  return FILTERED_BY_SYMBOL;

  }
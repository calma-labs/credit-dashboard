import { fetchReserves, getSlotForAPY } from './kaminolend/kamino_lend';
import { useJupLendData } from './juplend/hooks/useJupLendData';

type MatchedTokens = {
  
  symbol: string;

  kaminoLeftSide: {
    mintAddress: string,
    tvl: number,
    supplyAPY: number;
    borrowAPY: number;
  }

  juplendRightSide: {
    mintAddress: string,
    tvl: number,
    supplyAPY: number,
    borrowAPY: number,
  }

}

const KAMINO_DATA = await fetchReserves();
const JUPLEND_DATA = await useJupLendData();

const GET_KAMINO_SLOT = await getSlotForAPY();

export default async function App() {

  if(KAMINO_DATA.length === 0 || JUPLEND_DATA.tokens.length === 0) {
    return (<div>Loading...</div>);
  }

  let comparisonResults: MatchedTokens[] = [];

  const FILTERED_BY_SYMBOL = KAMINO_DATA.filter(

    kaminoTokens => JUPLEND_DATA.tokens.some(
    
      jupTokens => jupTokens.symbol === kaminoTokens.symbol &&
      jupTokens.mint === kaminoTokens.stats.mintAddress
    
    )
  );

  for (const KAMINO_TOKEN of FILTERED_BY_SYMBOL) {
    for (const JUP_TOKEN of JUPLEND_DATA.tokens) {
      if (KAMINO_TOKEN.symbol === JUP_TOKEN.symbol && KAMINO_TOKEN.stats.mintAddress === JUP_TOKEN.mint) {
      
        console.log(`Match found for symbol: ${KAMINO_TOKEN.symbol}`);

        comparisonResults.push({

          symbol: KAMINO_TOKEN.symbol,
          
          kaminoLeftSide: {
            mintAddress: KAMINO_TOKEN.tokenOraclePrice.mintAddress,
            tvl: Number(KAMINO_TOKEN.getDepositTvl().toFixed(2)),
            supplyAPY: Number((KAMINO_TOKEN.totalSupplyAPY(BigInt(GET_KAMINO_SLOT)) * 100).toFixed(2)),
            borrowAPY: Number((KAMINO_TOKEN.totalBorrowAPY(BigInt(GET_KAMINO_SLOT)) * 100).toFixed(2)),
          },

          juplendRightSide: {
            mintAddress: JUP_TOKEN.mint,
            tvl: JUP_TOKEN.tvlUsd,
            supplyAPY: JUP_TOKEN.supplyRate,
            borrowAPY: JUP_TOKEN.borrowRate,
          }
        
        });

        console.log(comparisonResults)

      }
    }
  }

  return (
    <div>
      <h1>Kamino Lend and JupLend Data comparison</h1>
      <p>check the console for more information!</p>
    </div>
  );
}

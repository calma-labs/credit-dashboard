//imports 
import { kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { new_error, standarizedJupLendToken } from './juplend/hooks/useJupLendData';
import { type MatchedTokens } from './globalComponents/globalTypes';




//main function 
export default async function matchedTokens() 
{

  
  //data fetch from each lending
  const LEFT_SIDE_LENDING =     await kaminoStandarizedTokens();
  const RIGHT_SIDE_LENDING =    await standarizedJupLendToken();


  //result of comparison
  let comparisonResults: MatchedTokens[] = [];

  console.log(LEFT_SIDE_LENDING, RIGHT_SIDE_LENDING);

  //error hanlder 
  if(
    LEFT_SIDE_LENDING.length   === 0   ||  //0 is equal to non existing list
    RIGHT_SIDE_LENDING.length  === 0   //||  //0 is equal to non existing list
    //new_error
  ) 
  {
    return (<div>Loading...</div>);
  }

  //filtering by symbol
  const FILTERED_BY_SYMBOL = LEFT_SIDE_LENDING.filter
  (

    //filtering by
    leftSideToken => 
      RIGHT_SIDE_LENDING.some(

      rightSideToken => 
      rightSideToken.symbol  === leftSideToken.symbol           &&  //filtering by same symbol
      rightSideToken.mintAddress    === leftSideToken.mintAddress          //filtering by same mint 

    )

  );

  console.log(FILTERED_BY_SYMBOL)

  //matching the tokens
  for (const LEFT_SIDE of FILTERED_BY_SYMBOL)  //left tokens
    {

    for (const RIGHT_SIDE of RIGHT_SIDE_LENDING)  //right tokens
      {

      if (
        LEFT_SIDE.symbol ===      RIGHT_SIDE.symbol      &&  //symbol for each lending should be euqal
        LEFT_SIDE.mintAddress === RIGHT_SIDE.mintAddress            //...same as mint 
      ) 
        {

            //filling list with matched tokens
            comparisonResults.push({

            //symbol of Matched Token
            symbol:         RIGHT_SIDE.symbol,

            //right side of comparison
            leftSide: {
              
              mintAddress:  LEFT_SIDE.mintAddress,
              tvl:          LEFT_SIDE.tvl,
              supplyAPY:    LEFT_SIDE.supplyAPY,
              utilization:  LEFT_SIDE.utilization,
              borrowRate:   LEFT_SIDE.borrowRate,

            },

            //right side of comparison
            rightSide: {
              
              mintAddress:  RIGHT_SIDE.mintAddress,
              tvl:          RIGHT_SIDE.tvl,
              supplyAPY:    RIGHT_SIDE.supplyAPY,
              utilization:  RIGHT_SIDE.utilization,
              borrowRate:   RIGHT_SIDE.borrowRate,

            },
          })
        }
    
    }
  
  }

  
  return comparisonResults;
}


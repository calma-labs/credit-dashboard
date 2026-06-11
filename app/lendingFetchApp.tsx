//imports 
import { kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { new_error, standarizedJupLendToken } from './juplend/hooks/useJupLendData';
import { type MatchedTokens, type ComparedMetric, StandarizedMetric } from './globalComponents/globalTypes';

//function filling the metrics with args given
function fillMetric(fillingArg: StandarizedMetric):ComparedMetric{
 
  return {

    mintAddress:  fillingArg.mintAddress,
    tvl:          fillingArg.tvl,
    utilization:  fillingArg.supplyAPY,
    supplyAPY:    fillingArg.supplyAPY,
    borrowRate:   fillingArg.borrowRate,

  }

}

//main function 
export default async function matchedTokens() 
{
  
  //data fetch from each lending
  const LEFT_SIDE_LENDING =     await kaminoStandarizedTokens();
  const RIGHT_SIDE_LENDING =    await standarizedJupLendToken();

  //blank metric for placehold
  const BLANK_METRIC: ComparedMetric = {

    mintAddress: '-',
    tvl: 0,
    utilization: '-',
    supplyAPY: '-',
    borrowRate: '-',

  }


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

  //both side's token
  LEFT_SIDE_LENDING.forEach(leftObject => {
    const matchingRightObject = RIGHT_SIDE_LENDING.find(
      rightObject => rightObject.symbol === leftObject.symbol
    );

    // Jeśli znaleźliśmy parę w obu tablicach
    if (matchingRightObject) {

      comparisonResults.push({

        symbol: leftObject.symbol,

        leftSide: fillMetric(leftObject),

        rightSide: fillMetric(matchingRightObject),
        
      });

    }
  });
  
  //left side
  const LEFT_SIDE_ONLY = LEFT_SIDE_LENDING.filter(leftObject =>!RIGHT_SIDE_LENDING.some(rightObject => rightObject.symbol === leftObject.symbol)).map(filtered =>{
    comparisonResults.push({

      symbol: filtered.symbol,

      leftSide: fillMetric(filtered),

      rightSide: BLANK_METRIC,

    });
  });
  
  //right side
  const RIGHT_SIDE_ONLY = LEFT_SIDE_LENDING.filter(rightObject =>!LEFT_SIDE_LENDING.some(leftObject => rightObject.symbol === leftObject.symbol)).map(filtered =>{
    comparisonResults.push({

      symbol: filtered.symbol,

      leftSide: BLANK_METRIC,

      rightSide: fillMetric(filtered),

    });
  });

  return comparisonResults;
}


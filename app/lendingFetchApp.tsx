import { kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { standarizedJupLendToken } from './juplend/hooks/useJupLendData';
import { type MatchedTokens, type ComparedMetric, StandarizedMetric } from './globalComponents/globalTypes';
import { fetchSaveData } from './save/useSaveData';

function fillMetric(fillingArg: StandarizedMetric): ComparedMetric {
  return {

    mintAddress:  fillingArg.mintAddress,
    tvl:          fillingArg.tvl,
    utilization:  fillingArg.utilization, 
    supplyAPY:    fillingArg.supplyAPY,
    borrowRate:   fillingArg.borrowRate,

  };
}

export default async function matchedTokens() {
  const LEFT_SIDE = await kaminoStandarizedTokens();
  const RIGHT_SIDE = await standarizedJupLendToken();

  let initialMatches: Omit<MatchedTokens, 'saveSide'>[] = [];

  if (LEFT_SIDE.length === 0 || RIGHT_SIDE.length === 0) {
    return [];
  }

  LEFT_SIDE.forEach(leftObject => {
    
    const matchingRightObject = RIGHT_SIDE.find(

      rightObject => rightObject.symbol === leftObject.symbol

    );

    if (matchingRightObject) {
      initialMatches.push({

        symbol: leftObject.symbol,
        leftSide: fillMetric(leftObject),
        rightSide: fillMetric(matchingRightObject),

      });
    
    }
  });

  const COMPARISON_RESULT: MatchedTokens[] = await Promise.all(
    initialMatches.map(async (match) => {
      const SAVE_DATA = await fetchSaveData(match.leftSide.mintAddress);

      return {
        ...match,
        saveSide: {

          mintAddress:  match.leftSide.mintAddress  || 'no Available token!',
          tvl:          SAVE_DATA?.tvl              || 0,
          supplyAPY:    SAVE_DATA?.supplyAPY        || 0,
          utilization:  SAVE_DATA?.utilization      || 0,
          borrowRate:   SAVE_DATA?.borrowRate       || 0,

        }
      };
    })
  );

  return COMPARISON_RESULT;
}
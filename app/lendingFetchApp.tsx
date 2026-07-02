import { kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { standarizedJupLendToken } from './juplend/hooks/useJupLendData';
import { type MatchedTokens, type ComparedMetric, StandarizedMetric } from './globalComponents/globalTypes';
import { fetchSaveData } from './save/saveData';

//this var is going to include every future lendings we are going to show on page
const lendings = [
  kaminoStandarizedTokens,
  standarizedJupLendToken,
  fetchSaveData,
];

//safe fetch
export async function safeFetch(): Promise<StandarizedMetric[][]> {
  //mapping every token as <[][]>
  const results = await Promise.allSettled(lendings.map((f) => f()));

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return [];
  });
}

//all choosen lendings
export async function getLends(): Promise<string[]> {
  const allResults = await safeFetch();

  //mapping lendings
  const mint = allResults.flat().map((t) => {
    return t.lending;
  });

  //removing duplicates
  return [...new Set(mint)];
}

//every token
export async function getMints(): Promise<string[]> {
  const allResults = await safeFetch();

  //mapping symbols
  const mint = allResults.flat().map((t) => {
    return t.mintAddress;
  });

  //removing duplicates
  return [...new Set(mint)];
}

//this function is returning standarized tokens from each lending as one list
export async function getStandarizedTokensList(): Promise<StandarizedMetric[]> {
  const allResults = await safeFetch();

  //flatting [][]
  const tokensList: StandarizedMetric[] = allResults.flat();

  return tokensList;
}
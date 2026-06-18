import { kaminoStandarizedTokens } from "./kaminolend/kamino_lend";
import { standarizedJupLendToken } from "./juplend/hooks/useJupLendData";
import { StandarizedMetric } from "./globalComponents/globalTypes";
import { getSaveData } from "./saveFinance/saveData";

//this var is going to include every future lendings we are going to show on page
const lendings = [
  kaminoStandarizedTokens,
  standarizedJupLendToken,
  getSaveData,
];

//safe fetch
export async function safeFetch(): Promise<StandarizedMetric[][]> {
  //mapping every token as <[][]>
  const eachToken = await Promise.all(lendings.map((f) => f()));

  return eachToken ?? [];
}

//every tokens that are stored on each lendings, <StandarizedMetric[][]>
const allResults = await safeFetch();

//all choosen lendings
export async function getLends(): Promise<string[]> {
  //mapping lendings
  const mint = allResults.flat().map((t) => {
    return t.lending;
  });

  //removing duplicates
  return [...new Set(mint)];
}

//every token
export async function getMints(): Promise<string[]> {
  //mapping symbols
  const mint = allResults.flat().map((t) => {
    return t.mintAddress;
  });

  //removing duplicates
  return [...new Set(mint)];
}

//this function is returning standarized tokens from each lending as one list
export async function getStandarizedTokensList(): Promise<StandarizedMetric[]> {
  //reducing the time complexity by unflatted [][]
  if (allResults.some((list) => !list.length)) return [];

  //flatting [][]
  const tokensList: StandarizedMetric[] = allResults.flat();

  return tokensList;
}

import { kaminoStandarizedTokens } from "./kaminolend/kamino_lend";
import { standarizedJupLendToken } from "./juplend/hooks/useJupLendData";
import { type ComparedMetric, StandarizedMetric } from "./globalComponents/globalTypes";
import { fetchSaveData } from "./save/saveData";
import { morphoStandarizedTokens } from "./morpho/morpho_lend";

const lendings = [
  kaminoStandarizedTokens,
  standarizedJupLendToken,
  fetchSaveData,
  morphoStandarizedTokens,
];

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

export async function safeFetch(): Promise<StandarizedMetric[][]> {
  const results = await Promise.allSettled(lendings.map((f) => f()));

  return results.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    console.error(`[safeFetch] lending #${i} failed:`, result.reason);
    return [];
  });
}

async function getSortedResults(): Promise<StandarizedMetric[]> {
  const allResults = await safeFetch();
  return allResults.flat().sort((a, b) => b.tvl - a.tvl);
}

export async function getLends(): Promise<string[]> {
  const sortedResults = await getSortedResults();

  const mint = sortedResults.map((t) => {
    return t.lending;
  });

  return [...new Set(mint)];
}

export async function getMints(): Promise<string[]> {
  const sortedResults = await getSortedResults();

  const mint = sortedResults.map((t) => {
    return t.mintAddress;
  });

  return [...new Set(mint)];
}

export async function getSymbols(): Promise<string[]> {
  const sortedResults = await getSortedResults();

  const symbols = sortedResults.map((t) => normalizeSymbol(t.symbol));

  return [...new Set(symbols)];
}

export async function getStandarizedTokensList(): Promise<StandarizedMetric[]> {
  const sortedResults = await getSortedResults();

  return sortedResults;
}
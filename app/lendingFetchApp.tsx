import { kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { standarizedJupLendToken } from './juplend/hooks/useJupLendData';
import { StandarizedMetric } from './globalComponents/globalTypes';
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

//every tokens that are stored on each lendings, <StandarizedMetric[][]>
const allResults = await safeFetch();
const sortedResults = allResults.flat().sort((a, b) => b.tvl - a.tvl); //sorting by tvl, the highest first

//all choosen lendings
export async function getLends(): Promise<string[]> {
    //mapping lendings
    const mint = sortedResults.map((t) => {
        return t.lending;
    });

    //removing duplicates
    return [...new Set(mint)];
}

//every token
export async function getMints(): Promise<string[]> {
    //mapping symbols

    const mint = sortedResults.map((t) => {
        return t.mintAddress;
    });

    //removing duplicates

    return [...new Set(mint)];
}

//this function is returning standarized tokens from each lending as one list
export async function getStandarizedTokensList(): Promise<StandarizedMetric[]> {
    //flatting [][]
    const tokensList: StandarizedMetric[] = sortedResults;

    return tokensList;
}

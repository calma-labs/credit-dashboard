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

async function getSortedResults(): Promise<StandarizedMetric[]> {
    const allResults = await safeFetch();
    return allResults.flat().sort((a, b) => b.tvl - a.tvl);
}

export async function getLends(): Promise<string[]> {
    //mapping lendings
    const mint = sortedResults.map((t) => {
        return t.lending;
    });

    //removing duplicates
    return [...new Set(mint)];
}

export async function getMints(): Promise<string[]> {
    //mapping symbols

    const mint = sortedResults.map((t) => {
        return t.mintAddress;
    });

    //removing duplicates

    return [...new Set(mint)];
}

export async function getStandarizedTokensList(): Promise<StandarizedMetric[]> {
    //flatting [][]
    const tokensList: StandarizedMetric[] = sortedResults;

    return tokensList;
}

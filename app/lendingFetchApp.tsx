import { StandarizedMetric } from './globalComponents/globalTypes';
import { FetchingManager } from './api/chart/fetchers/FetchingManager';

function normalizeSymbol(symbol: string): string {
    return symbol.toUpperCase();
}

export async function safeFetch(): Promise<StandarizedMetric[][]> {
    const fetchers = FetchingManager.getAllFetchers();
    const results = await Promise.allSettled(
        fetchers.map((f) => f.fetchMetrics()),
    );

    return results.map((result, i) => {
        if (result.status === 'fulfilled') {
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

export async function getAllData(): Promise<{
    tokensList: StandarizedMetric[];
    lends: string[];
    symbols: string[];
}> {
    const tokensList = await getSortedResults();

    const lends = [...new Set(tokensList.map((t) => t.lending))];
    const symbols = [
        ...new Set(tokensList.map((t) => normalizeSymbol(t.symbol))),
    ];

    return { tokensList, lends, symbols };
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

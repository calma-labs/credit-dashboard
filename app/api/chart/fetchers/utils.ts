import { TokenHistoryPoint } from './types';

export function symbolMatches(poolSymbol: string, target: string): boolean {
    const normalizedPool = poolSymbol
        .replace(/\s*\(.*?\)/g, '')
        .replace(/-[A-Z0-9]+$/, '')
        .trim()
        .toUpperCase();
    const normalizedTarget = target.toUpperCase();
    return (
        normalizedPool === normalizedTarget ||
        normalizedPool === `W${normalizedTarget}`
    );
}

export function downsampleToDaily<T>(
    points: T[],
    getTimestamp: (p: T) => number,
    mapPoint: (p: T, dateKey: string) => TokenHistoryPoint,
): TokenHistoryPoint[] {
    const dailyMap = new Map<string, T>();

    for (const p of points) {
        const dateKey = new Date(getTimestamp(p) * 1000)
            .toISOString()
            .split('T')[0];
        dailyMap.set(dateKey, p);
    }

    return Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, p]) => mapPoint(p, dateKey));
}

export async function fetchJson<T>(
    url: string,
    revalidateSeconds = 300,
): Promise<T> {
    const res = await fetch(url, {
        next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} on URL: ${url}`);
    }
    return res.json() as Promise<T>;
}

export async function fetchProtocolTotalActiveLoansFromDefiLlama(
    platform: string,
): Promise<number | null> {
    try {
        let slug = platform.toLowerCase();
        // Add common overrides if needed
        if (slug === 'jupiter') slug = 'jup-lend';
        if (slug === 'marginfi') slug = 'marginfi';

        const url = `https://api.llama.fi/protocol/${slug}`;
        const data = await fetchJson<any>(url, 3600); // cache for 1 hour

        if (
            data &&
            data.currentChainTvls &&
            typeof data.currentChainTvls.borrowed === 'number'
        ) {
            return data.currentChainTvls.borrowed;
        }
        return null;
    } catch {
        return null;
    }
}

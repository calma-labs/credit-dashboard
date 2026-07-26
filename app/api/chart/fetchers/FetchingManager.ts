import { ITokenFetcher, TokenDataResult } from './types';
import { DefiLlamaFetcher } from './DefiLlamaFetcher';
import { MorphoFetcher } from './MorphoFetcher';
import { KaminoFetcher } from './KaminoFetcher';
import { JupLendFetcher } from './JupLendFetcher';
import { SaveFetcher } from './SaveFetcher';
import { fetchProtocolTotalActiveLoansFromDefiLlama } from './utils';

export class FetchingManager {
    private static fetchers: Record<string, ITokenFetcher> = {
        kamino: new KaminoFetcher(),
        jupiter: new JupLendFetcher(),
        save: new SaveFetcher(),
        marginfi: new DefiLlamaFetcher(),
        morpho: new MorphoFetcher(),
    };

    private static fallbackFetcher = new DefiLlamaFetcher();

    static getFetcher(platform: string): ITokenFetcher {
        const fetcher = this.fetchers[platform.toLowerCase()];
        if (!fetcher) {
            return this.fallbackFetcher;
        }
        return fetcher;
    }

    static async fetch(platform: string, asset: string, collateral?: string): Promise<TokenDataResult | null> {
        const platformKey = platform.toLowerCase();
        const fetcher = this.fetchers[platformKey];
        
        let result: TokenDataResult | null = null;

        if (fetcher && platformKey !== 'marginfi') {
            try {
                result = await fetcher.fetch(platform, asset, collateral);
            } catch (err) {
                console.warn(`[FetchingManager] Fetcher failed for ${platform}, falling back to DefiLlama...`, err);
            }
        }

        if (!result) {
            result = await this.fallbackFetcher.fetch(platform, asset, collateral);
        }

        if (result && result.snapshot) {
            const totalActiveLoans = await fetchProtocolTotalActiveLoansFromDefiLlama(platform);
            result.snapshot.protocolTotalActiveLoans = totalActiveLoans;
        }

        return result;
    }

    static getAllFetchers(): ITokenFetcher[] {
        const fetchers = [
            this.fetchers['kamino'],
            this.fetchers['jupiter'],
            this.fetchers['save'],
            this.fetchers['morpho'],
            this.fetchers['marginfi'],
        ];
        console.log('[FetchingManager] Returning fetchers:', fetchers.length);
        return fetchers;
    }
}

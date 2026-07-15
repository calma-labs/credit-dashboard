import { ITokenFetcher } from './types';
import { DefiLlamaFetcher } from './DefiLlamaFetcher';
import { MorphoFetcher } from './MorphoFetcher';
import { KaminoFetcher } from './KaminoFetcher';
import { JupLendFetcher } from './JupLendFetcher';
import { SaveFetcher } from './SaveFetcher';

export class FetchingManager {
    private static fetchers: Record<string, ITokenFetcher> = {
        kamino: new KaminoFetcher(),
        jupiter: new JupLendFetcher(),
        save: new SaveFetcher(),
        marginfi: new DefiLlamaFetcher(),
        morpho: new MorphoFetcher(),
    };

    static getFetcher(platform: string): ITokenFetcher {
        const fetcher = this.fetchers[platform.toLowerCase()];
        if (!fetcher) {
            return new DefiLlamaFetcher();
        }
        return fetcher;
    }

    static getAllFetchers(): ITokenFetcher[] {
        return [
            this.fetchers['kamino'],
            this.fetchers['jupiter'],
            this.fetchers['save'],
            this.fetchers['morpho'],
        ];
    }
}

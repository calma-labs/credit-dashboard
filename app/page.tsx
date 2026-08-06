import {
    getLends,
    getMints,
    getStandarizedTokensList,
} from './lendingFetchApp';
import ComparedTokens from './globalComponents/comparedTokens';
import './globalStyles/cardStyle.css';
import { kaminoStandarizedTokens } from './kaminolend/kamino_lend';

export const dynamic = 'force-dynamic';

function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

function formatTVL(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
}

export default async function App() {
    //lends, mints and tokens
    const lends = await getLends();
    const mints = await getMints();
    const tokensList = await getStandarizedTokensList();

    return (
        <div>
            <div className='title-container'>
                <h1 className='main-title'>Credit Dashboard</h1>
                <span className='mint-address'>Lending Comparison</span>
            </div>

            <ComparedTokens
                tokens={tokensList}
                lends={lends}
                symbols={mints}
            ></ComparedTokens>
        </div>
    );
}

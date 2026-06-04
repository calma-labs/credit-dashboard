import { createSolanaRpc, address } from '@solana/kit';
import { KaminoMarket, KaminoReserve, getMarketsFromApi } from '@kamino-finance/klend-sdk';

const RPC = 'https://api.mainnet-beta.solana.com';
const SLOT_DURATION_MS = 400;

async function fetchReserves(): Promise<KaminoReserve[]> {
  const rpc = createSolanaRpc(RPC);
  const markets = await getMarketsFromApi();

  const results = await Promise.all(
    markets.slice(0, 2).map((config) =>
      KaminoMarket.load(
        rpc as Parameters<typeof KaminoMarket.load>[0],
        address(config.lendingMarket),
        SLOT_DURATION_MS,
        undefined,
        true
      )
    )
  );

  return results
    .flatMap((market) => market?.getReserves() ?? [])
    .filter((reserve) => reserve.getBorrowedAmount().gt(0));
}

export default async function App() {
  const reserves = await fetchReserves();
  console.log(reserves.map((r) => r.address));
  return (
    <div>
      {reserves.map((reserve) => (
        <div key={reserve.address}>
          <h2>Reserve {reserve.address} ({reserve.symbol})</h2>
          <p>Available: {reserve.getLiquidityAvailableAmount().div(reserve.getMintFactor()).toFixed(6)}</p>
          <p>Borrowed: {reserve.getBorrowedAmount().div(reserve.getMintFactor()).toFixed(6)}</p>
          <p>Utilization: {(reserve.calculateUtilizationRatio() * 100).toFixed(2)}%</p>
          <p>Deposit TVL: ${reserve.getDepositTvl().toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

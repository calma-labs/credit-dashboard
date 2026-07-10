import {
  getLends,
  getSymbols,
  getStandarizedTokensList,
} from "./lendingFetchApp";
import ComparedTokens from "./globalComponents/comparedTokens";
import "./globalStyles/cardStyle.css";
import { kaminoStandarizedTokens } from "./kaminolend/kamino_lend";

export const dynamic = "force-dynamic";

export default async function App() {
  const lends = await getLends();
  const tokenSymbols = await getSymbols();
  const tokensList = await getStandarizedTokensList();

  return (
    <div>
      <div className="title-container">
        <h1 className="main-title">Credit Dashboard</h1>
        <span className="mint-address">Lending Comparison</span>
      </div>

      <ComparedTokens
        tokens={tokensList}
        lends={lends}
        symbols={tokenSymbols}
      ></ComparedTokens>
    </div>
  );
}
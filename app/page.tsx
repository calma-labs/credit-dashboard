import {
  getLends,
  getMints,
  getStandarizedTokensList,
} from "./lendingFetchApp";
import ComparedTokens from "./globalComponents/comparedTokens";
import { getSaveData } from "./saveFinance/saveData";
import "./globalStyles/cardStyle.css";

export const dynamic = "force-dynamic";

//main function
export default async function App() {
  //lends, mints and tokens
  const lends = await getLends();
  const mints = await getMints();
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
        symbols={mints}
      ></ComparedTokens>
    </div>
  );
}

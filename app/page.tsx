import matchedTokens from "./lendingFetchApp";
import ComparedTokens from "./globalComponents/comparedTokens";
import './globalStyles/cardStyle.css'

export const dynamic = 'force-dynamic';

//main function 
export default async function App() 
{

  //matched tokens
  const MATCHED_TOKENS = await matchedTokens();

  return (
    <div>
      
      <div className="title-container">
        
        <h1 className="main-title">Credit Dashboard</h1>
        <span className="title-badge">Lending Comparison</span>
            
      </div>

      <ComparedTokens tokens={MATCHED_TOKENS}></ComparedTokens>

    </div>
  );

}
import matchedTokens from "./lendingFetchApp";
import ComparedTokens from "./globalComponents/comparedTokens";
import './globalStyles/cardStyle.css'

//main function 
export default async function App() 
{

  //matched tokens
  const MATCHED_TOKENS = await matchedTokens();
  console.log(MATCHED_TOKENS, '!');

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
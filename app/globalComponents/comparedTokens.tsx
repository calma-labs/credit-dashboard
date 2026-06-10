'use client';
import { type MatchedTokens } from "./globalTypes";
import "../globalStyles/cardStyle.css";

//main function 
export default function ComparedTokens({tokens}: any) 
{
    if(!tokens || tokens.length === 0)
    {
        return(<div>Loading...</div>)
    }

    console.log(tokens)

    return (
        <div>
    
            {
                tokens.map((t: MatchedTokens, index: number) => {
                    return (
                        <div key={index} className="token-pair-row">
                            
                            <h1 className="pair-symbol">{t.symbol}</h1>
                            
                            <div className="sides-wrapper">
                                
                                {/* left card */}
                                <div className="token-card">
                                    <h4 className="card-title">juplend</h4>
                                    
                                    <div className="data-row">
                                        <span className="data-label">Mint:</span>
                                        <span className="mint-address" title={t.leftSide.mintAddress}>
                                            {t.leftSide.mintAddress}
                                        </span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">TVL:</span>
                                        <span className="data-value">${t.leftSide.tvl.toLocaleString()}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Supply APY:</span>
                                        <span className="apy-green">{t.leftSide.supplyAPY}%</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Utilization:</span>
                                        <span className="data-value">{t.leftSide.utilization}%</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Borrow Rate:</span>
                                        <span className="rate-red">{t.leftSide.borrowRate}%</span>
                                    </div>
                                </div>

                                {/* right card */}
                                <div className="token-card">
                                    <h4 className="card-title">kamino</h4>
                                    
                                    <div className="data-row">
                                        <span className="data-label">Mint:</span>
                                        <span className="mint-address" title={t.rightSide.mintAddress}>
                                            {t.rightSide.mintAddress}
                                        </span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">TVL:</span>
                                        <span className="data-value">${t.rightSide.tvl.toLocaleString()}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Supply APY:</span>
                                        <span className="apy-green">{t.rightSide.supplyAPY}%</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Utilization:</span>
                                        <span className="data-value">{t.rightSide.utilization}%</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">Borrow Rate:</span>
                                        <span className="rate-red">{t.rightSide.borrowRate}%</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })
            }

        </div>
    );

}
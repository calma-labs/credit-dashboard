import { fetchReserves, getSlotForAPY } from './kaminolend/kamino_lend';
import { useJupLendData } from './juplend/hooks/useJupLendData';

type MatchedTokens = {
  
  symbol: string;

  kaminoLeftSide: {
    mintAddress: string,
    tvl: number,
    supplyAPY: number;
    utilization: number,
    borrowRate: number,
  }

  juplendRightSide: {
    mintAddress: string,
    tvl: number,
    supplyAPY: number,
    utilization: number,
    borrowRate: number,
  }

}

const KAMINO_DATA = await fetchReserves();
const JUPLEND_DATA = await useJupLendData();
const GET_KAMINO_SLOT = await getSlotForAPY();

export default async function App() {

  if(KAMINO_DATA.length === 0 || JUPLEND_DATA.tokens.length === 0) {
    return (<div>Loading...</div>);
  }

  let comparisonResults: MatchedTokens[] = [];

  const FILTERED_BY_SYMBOL = KAMINO_DATA.filter(

    kaminoTokens => JUPLEND_DATA.tokens.some(
    
      jupTokens => jupTokens.symbol === kaminoTokens.symbol &&
      jupTokens.mint === kaminoTokens.stats.mintAddress
    
    )
  );

  console.log(JUPLEND_DATA, KAMINO_DATA);

  for (const KAMINO_TOKEN of FILTERED_BY_SYMBOL) {
    for (const JUP_TOKEN of JUPLEND_DATA.tokens) {
      if (KAMINO_TOKEN.symbol === JUP_TOKEN.symbol && KAMINO_TOKEN.stats.mintAddress === JUP_TOKEN.mint) {
      
        console.log(`Match found for symbol: ${KAMINO_TOKEN.symbol}`);

        comparisonResults.push({
          symbol: KAMINO_TOKEN.symbol,
          
          kaminoLeftSide: {

            mintAddress: KAMINO_TOKEN.tokenOraclePrice.mintAddress,
            tvl: Number(KAMINO_TOKEN.getDepositTvl().toFixed(2)),
            supplyAPY: Number((KAMINO_TOKEN.totalSupplyAPY(BigInt(GET_KAMINO_SLOT)) * 100).toFixed(2)),
            utilization: Number((KAMINO_TOKEN.calculateUtilizationRatio() * 100).toFixed(2)),
            borrowRate: Number((KAMINO_TOKEN.calculateBorrowAPR(BigInt(GET_KAMINO_SLOT), Math.floor(KAMINO_TOKEN.calculateUtilizationRatio() * 10000)) * 100).toFixed(2)),
          
          },

          juplendRightSide: {

            mintAddress: JUP_TOKEN.mint,
            tvl: Number(JUP_TOKEN.tvlUsd),
            supplyAPY: Number(JUP_TOKEN.apy.toFixed(2)),
            utilization: Number(JUP_TOKEN.utilization.toFixed(2)),
            borrowRate: Number(JUP_TOKEN.borrowRate.toFixed(2)),

          }
        });
      }
    }

  }
  
 return (
  <div style={{ 
    padding: '30px', 
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
    backgroundColor: '#0c0f14', 
    color: '#f8fafc',
    minHeight: '100vh' 
  }}>
    <h1 style={{ 
      fontSize: '24px', 
      fontWeight: '600', 
      marginBottom: '24px', 
      color: '#ffffff',
      letterSpacing: '-0.5px'
    }}>
      Kamino Lend & JupLend Comparison
    </h1>
    
    <div style={{ 
      overflowX: 'auto', 
      borderRadius: '12px', 
      border: '1px solid #1e293b',
      backgroundColor: '#111827'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#1f2937', borderBottom: '2px solid #374151' }}>
            <th style={{ padding: '16px', fontWeight: '600', color: '#9ca3af' }}>Token</th>
            {/* colSpan zmieniony na 4, bo mamy teraz 4 kolumny w sekcji */}
            <th style={{ padding: '16px', fontWeight: '600', color: '#38bdf8', textAlign: 'center' }} colSpan={4}>Kamino Lend</th>
            <th style={{ padding: '16px', fontWeight: '600', color: '#a78bfa', textAlign: 'center' }} colSpan={4}>Jupiter Lend</th>
          </tr>
          <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
            <th></th>
            {/* Kamino Headers */}
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>TVL</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Supply APY</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Borrow Rate</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Utylizacja</th>
            
            {/* Jupiter Headers */}
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>TVL</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Supply APY</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Borrow Rate</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Utylizacja</th>
          </tr>
        </thead>
        <tbody>
          {comparisonResults.map((token, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
              {/* Symbol */}
              <td style={{ padding: '16px', fontWeight: '600', color: '#ffffff' }}>{token.symbol}</td>
              
              {/* Kamino data */}
              <td style={{ padding: '16px', color: '#e2e8f0' }}>${token.kaminoLeftSide.tvl.toLocaleString()}</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: '500' }}>{token.kaminoLeftSide.supplyAPY}%</td>
              <td style={{ padding: '16px', color: '#f87171', fontWeight: '500' }}>{token.kaminoLeftSide.borrowRate}%</td>
              <td style={{ padding: '16px', color: '#60a5fa' }}>{token.kaminoLeftSide.utilization}%</td>
              
              {/* Jupiter data */}
              <td style={{ padding: '16px', color: '#e2e8f0' }}>${token.juplendRightSide.tvl.toLocaleString()}</td>
              <td style={{ padding: '16px', color: '#34d399', fontWeight: '500' }}>{token.juplendRightSide.supplyAPY}%</td>
              <td style={{ padding: '16px', color: '#f87171', fontWeight: '500' }}>{token.juplendRightSide.borrowRate}%</td>
              <td style={{ padding: '16px', color: '#60a5fa' }}>{token.juplendRightSide.utilization}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}

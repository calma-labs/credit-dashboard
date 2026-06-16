
//imports
import { fetchReserves, getSlotForAPY, kaminoStandarizedTokens } from './kaminolend/kamino_lend';
import { useJupLendData, new_error } from './juplend/hooks/useJupLendData';
import { fetchSaveData } from  './save/useSaveData';
import { KaminoReserve } from '@kamino-finance/klend-sdk';

export const dynamic = 'force-dynamic';

//metric's type
type MatchedTokens = {
  symbol: string;
  kaminoLeftSide: {
    mintAddress:  string;
    tvl:          number;
    supplyAPY:    number;
    utilization:  number;
    borrowRate:   number;
  };
  juplendRightSide: {
    mintAddress:  string;
    tvl:          number;
    supplyAPY:    number;
    utilization:  number;
    borrowRate:   number;
  };
  saveSide: {
    mintAddress:  string;
    tvl:          number;
    supplyAPY:    number;
    utilization:  number;
    borrowRate:   number;
  };
}


function kaminoTVL(token: KaminoReserve): number {
  return Number(token.getDepositTvl().toFixed(2));
}

function kaminoUtilization(token: KaminoReserve): number {
  return Number((token.calculateUtilizationRatio() * 100).toFixed(2));
}

function kaminoBorrowRate(token: KaminoReserve, slot: number): number {
  return Number((token.calculateBorrowAPR(BigInt(slot), Math.floor(token.calculateUtilizationRatio() * 10000)) * 100).toFixed(2));
}

function kaminoSupplyAPY(token: KaminoReserve, slot: number): number {
  return Number((token.totalSupplyAPY(BigInt(slot)) * 100).toFixed(2));
}


export const metadata = {
  title: 'Credit dashboard',
};
export default async function App() {
  const kaminoData =     await fetchReserves();
  const juplendData =    await useJupLendData();
  const getKaminoSlot = await getSlotForAPY();

  if (kaminoData.length === 0 || juplendData.tokens.length === 0) {
    return (<div>Loading...</div>);
  }

  const filteredBySymbol = kaminoData.filter(kaminoTokens => 
    juplendData.tokens.some(
      jupTokens => jupTokens.symbol === kaminoTokens.symbol && 
                   jupTokens.mint === kaminoTokens.stats.mintAddress 
    )
  );

  let initialMatches: Omit<MatchedTokens, 'saveSide'>[] = [];

  for (const kaminoToken of filteredBySymbol) {
    for (const jupToken of juplendData.tokens) {
      if (
        kaminoToken.symbol === jupToken.symbol &&
        kaminoToken.stats.mintAddress === jupToken.mint 
      ) {
        initialMatches.push({
          symbol: kaminoToken.symbol,
          kaminoLeftSide: {
            mintAddress:  kaminoToken.tokenOraclePrice.mintAddress,
            tvl:          kaminoTVL(kaminoToken),
            supplyAPY:    kaminoSupplyAPY(kaminoToken, getKaminoSlot),
            utilization:  kaminoUtilization(kaminoToken),
            borrowRate:   kaminoBorrowRate(kaminoToken, getKaminoSlot),
          },
          juplendRightSide: {
            mintAddress:  jupToken.mint,
            tvl:          Number(jupToken.tvlUsd),
            supplyAPY:    Number(jupToken.apy.toFixed(2)),
            utilization:  Number(jupToken.utilization.toFixed(2)),
            borrowRate:   Number(jupToken.borrowRate.toFixed(2)),
          },
        });
      }
    }
  }

 
  const comparisonResults: MatchedTokens[] = await Promise.all(
    initialMatches.map(async (match) => {
      const saveData = await fetchSaveData(match.kaminoLeftSide.mintAddress);
      return {
        ...match,
        saveSide: {
          mintAddress: match.kaminoLeftSide.mintAddress,
          tvl:          saveData?.tvl || 0,
          supplyAPY:    saveData?.supplyAPY || 0,
          utilization:  saveData?.utilization || 0,
          borrowRate:   saveData?.borrowRate || 0,
        }
      };
    })
  );
  
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
        Kamino Lend, JupLend & Save Protocol Comparison
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
              <th style={{ padding: '16px', fontWeight: '600', color: '#38bdf8', textAlign: 'center' }} colSpan={4}>Kamino Lend</th>
              <th style={{ padding: '16px', fontWeight: '600', color: '#a78bfa', textAlign: 'center' }} colSpan={4}>Jupiter Lend</th>
              <th style={{ padding: '16px', fontWeight: '600', color: '#10b981', textAlign: 'center' }} colSpan={4}>Save Protocol</th>
            </tr>
            <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
              <th></th>
              {/* Kamino Headers */}
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>TVL</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Supply APY</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Borrow Rate</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Utilization</th>
              
              {/* Jupiter Headers */}
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>TVL</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Supply APY</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Borrow Rate</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Utilization</th>
              
              {/* Save Protocol Headers */}
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>TVL</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Supply APY</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Borrow Rate</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {comparisonResults.map((token, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
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
                
                {/* Save data */}
                <td style={{ padding: '16px', color: '#e2e8f0' }}>${token.saveSide.tvl.toLocaleString()}</td>
                <td style={{ padding: '16px', color: '#10b981', fontWeight: '500' }}>{token.saveSide.supplyAPY}%</td>
                <td style={{ padding: '16px', color: '#f87171', fontWeight: '500' }}>{token.saveSide.borrowRate}%</td>
                <td style={{ padding: '16px', color: '#60a5fa' }}>{token.saveSide.utilization}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
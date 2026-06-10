let saveMarketConfigsCache: any = null;
export async function fetchSaveData(mintAddress: string) {
  try {
    if (!saveMarketConfigsCache) {
      const configRes = await fetch('https://api.solend.fi/v1/markets/configs?scope=all', { cache: 'no-store' });
      if (!configRes.ok) throw new Error('Failed to fetch Save market configs');
      saveMarketConfigsCache = await configRes.json();
    }

    let reserveId: string | undefined;
    
    const mainMarket = saveMarketConfigsCache.find((m: any) => m.name === 'Main' || m.isPrimary);
    if (mainMarket) {
      const reserve = mainMarket.reserves.find((r: any) => r.liquidityToken.mint === mintAddress);
      if (reserve) reserveId = reserve.address;
    }

    if (!reserveId) {
      for (const market of saveMarketConfigsCache) {
        const reserve = market.reserves.find((r: any) => r.liquidityToken.mint === mintAddress);
        if (reserve) {
          reserveId = reserve.address;
          break;
        }
      }
    }

    if (!reserveId) throw new Error(`No Save reserve found for mint: ${mintAddress}`);

    const [reserveRes, tvlRes] = await Promise.all([
      fetch(`https://api.solend.fi/v1/reserves?ids=${reserveId}`, { cache: 'no-store' }),
      fetch('https://api.llama.fi/tvl/save', { cache: 'no-store' }),
    ]);

    if (!reserveRes.ok) throw new Error(`Solend API ${reserveRes.status}`);
    const reserveJson = await reserveRes.json();
    const entry = (reserveJson?.results ?? [])[0];
    if (!entry) throw new Error('No reserve data from Solend API');

    const rates = entry.rates ?? {};
    const liq   = entry.reserve?.liquidity ?? {};

    const supplyAPY  = parseFloat(parseFloat(rates.supplyInterest ?? '0').toFixed(2));
    const borrowRate = parseFloat(parseFloat(rates.borrowInterest ?? '0').toFixed(2));

    const WADS     = 1e18;
    const DECIMALS = Math.pow(10, liq.mintDecimals ?? 6);
    const borrowed = parseFloat(liq.borrowedAmountWads ?? '0') / WADS / DECIMALS;
    const available = parseFloat(liq.availableAmount ?? '0') / DECIMALS;
    const total    = borrowed + available;
    const utilization = total > 0
        ? parseFloat(((borrowed / total) * 100).toFixed(2))
        : 0;

    const marketPrice = parseFloat(liq.marketPrice ?? '0');
    let tvl = total > 0 && marketPrice > 0 
      ? Math.round(total * marketPrice) 
  : 0;
  tvl = tvl/ WADS;

    return {
      mintAddress,
      tvl,
      utilization,
      supplyAPY,
      borrowRate,
    };
  } catch (err) {
    console.warn('Save protocol fetch error:', err.message);

    return {
      mintAddress,
      tvl: 0,
      utilization: 0,
      supplyAPY: 0,
      borrowRate: 0,
    };
  }
}
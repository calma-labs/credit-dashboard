import { NextRequest, NextResponse } from "next/server";

const COINGECKO_SEARCH_URL = "https://api.coingecko.com/api/v3/search";

const STATIC_ICON_MAP: Record<string, string> = {
  "usdc": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "usdt": "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661",
  "dai": "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996",
  "pyusd": "https://coin-images.coingecko.com/coins/images/31212/large/PYUSD_Token_Logo_2x.png?1765987788",
  "usde": "https://coin-images.coingecko.com/coins/images/33613/large/usde.png?1733810059",
  "susde": "https://coin-images.coingecko.com/coins/images/33669/large/sUSDe.png?1733810072",
  "usds": "https://coin-images.coingecko.com/coins/images/39926/large/usds.png?1724779721",
  "susds": "https://coin-images.coingecko.com/coins/images/39925/large/sUSDS.png?1724779538",
  "gho": "https://coin-images.coingecko.com/coins/images/30663/large/gho-token-logo.png?1720517092",
  "frax": "https://coin-images.coingecko.com/coins/images/13422/large/FRAX_icon.png?1696513182",
  "lusd": "https://coin-images.coingecko.com/coins/images/14666/large/Group_3.png?1696514341",
  "eurc": "https://coin-images.coingecko.com/coins/images/26045/large/euro-coin.png?1696525101",
  "crvusd": "https://coin-images.coingecko.com/coins/images/30118/large/crvusd.jpeg?1696529040",
  "sdai": "https://coin-images.coingecko.com/coins/images/32610/large/sdai.png?1698851541",
  "usda": "https://coin-images.coingecko.com/coins/images/36098/large/usda.png?1710433967",
  "dola": "https://coin-images.coingecko.com/coins/images/14287/large/dola.png?1696513960",
  "fdusd": "https://coin-images.coingecko.com/coins/images/31079/large/firstdigitalusd.jpg?1696529912",
  "gusd": "https://coin-images.coingecko.com/coins/images/5992/large/gemini-dollar-gusd.png?1696506408",
  "tusd": "https://coin-images.coingecko.com/coins/images/3449/large/tusd.png?1696504140",
  "wusdm": "https://coin-images.coingecko.com/coins/images/36429/large/wUSDM.png?1711524052",
  "jupusd": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "ausd": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "syrupusdc": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "btc": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
  "eth": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  "sol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "wbtc": "https://coin-images.coingecko.com/coins/images/7598/large/WBTCLOGO.png?1764496367",
  "weth": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
  "cbbtc": "https://coin-images.coingecko.com/coins/images/40143/large/cbbtc.webp?1726136727",
  "tbtc": "https://coin-images.coingecko.com/coins/images/11224/large/0x18084fba666a33d37592fa2633fd49a74dd93a88.png?1696511155",
  "lbtc": "https://coin-images.coingecko.com/coins/images/41207/large/lbtc.webp?1731044294",
  "steth": "https://coin-images.coingecko.com/coins/images/13442/large/steth_logo.png?1696513206",
  "wsteth": "https://coin-images.coingecko.com/coins/images/18834/large/wstETH.png?1696518295",
  "reth": "https://coin-images.coingecko.com/coins/images/20764/large/reth.png?1696520159",
  "cbeth": "https://coin-images.coingecko.com/coins/images/27008/large/cbeth.png?1709186989",
  "eeth": "https://coin-images.coingecko.com/coins/images/33059/large/eETH.png?1700199587",
  "weeth": "https://coin-images.coingecko.com/coins/images/33033/large/weETH.png?1701438396",
  "ezeth": "https://coin-images.coingecko.com/coins/images/34753/large/ezeth.png?1713436401",
  "rseth": "https://coin-images.coingecko.com/coins/images/35020/large/rsETH.png?1708404608",
  "jitosol": "https://coin-images.coingecko.com/coins/images/28046/large/JitoSOL_Token_Logo_Green.png?1779807693",
  "msol": "https://coin-images.coingecko.com/coins/images/17752/large/mSOL.png?1696517269",
  "jupsol": "https://coin-images.coingecko.com/coins/images/37151/large/jupsol.png?1713426027",
  "jlp": "https://coin-images.coingecko.com/coins/images/35088/large/jlp.png?1709712613",
  "jup": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png?1704266489",
  "morpho": "https://coin-images.coingecko.com/coins/images/52011/large/morpho.png?1732098679",
  "aave": "https://coin-images.coingecko.com/coins/images/12645/large/AAVE.png?1696512452",
  "comp": "https://coin-images.coingecko.com/coins/images/10775/large/COMP.png?1696510737",
  "mkr": "https://coin-images.coingecko.com/coins/images/1364/large/Mark_Maker.png?1696502423",
  "crv": "https://coin-images.coingecko.com/coins/images/12124/large/Curve.png?1696511967",
  "link": "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1696502009",
  "pst": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "mglo": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  "dfdvsol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "rlusd": "https://coin-images.coingecko.com/coins/images/39563/large/rlusd.png?1723187216",
  "kbtc": "https://coin-images.coingecko.com/coins/images/39902/large/kbtc.png?1724754593",
  "prime": "https://coin-images.coingecko.com/coins/images/29053/large/prime-logo.png?1696528028",
  "ena": "https://coin-images.coingecko.com/coins/images/36531/large/ena.png?1711704257",
  "ldo": "https://coin-images.coingecko.com/coins/images/13573/large/Lido_DAO.png?1696513326",
  "uni": "https://coin-images.coingecko.com/coins/images/12504/large/uni.jpg?1696512319",
  "arb": "https://coin-images.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg?1696516109",
  "op": "https://coin-images.coingecko.com/coins/images/25244/large/Optimism.png?1696524385",
  "usd0": "https://coin-images.coingecko.com/coins/images/38318/large/usd0.png?1718619623",
  "usd0++": "https://coin-images.coingecko.com/coins/images/38663/large/usd0__.png?1720780282",
  "usdm": "https://coin-images.coingecko.com/coins/images/36429/large/wUSDM.png?1711524052",
  "reusd": "https://coin-images.coingecko.com/coins/images/38981/large/reusd.png?1720519176",
  "falconx": "https://coin-images.coingecko.com/coins/images/28135/large/falconx.png?1696527123",
  "usd3": "https://coin-images.coingecko.com/coins/images/37735/large/usd3.png?1715330362",
  "juiced": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png?1704266489",
  "mf-one": "https://coin-images.coingecko.com/coins/images/35087/large/marginfi.png?1709712602",
  "marginfi": "https://coin-images.coingecko.com/coins/images/35087/large/marginfi.png?1709712602",
  "pendle": "https://coin-images.coingecko.com/coins/images/15103/large/Pendle_Logo_Normal.png?1696514728",
  "xrp": "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442",
  "apx": "https://coin-images.coingecko.com/coins/images/33753/large/APX_Token_Icon.png?1702951167",
};

const ASSET_ID_OVERRIDES: Record<string, string> = {
  weth: "weth",
  wbtc: "wrapped-bitcoin",
  cbbtc: "coinbase-wrapped-btc",
  jitosol: "jito-staked-sol",
  jupsol: "jupiter-staked-sol",
  msol: "marinade-staked-sol",
  usde: "ethena-usde",
  pyusd: "paypal-usd",
  susde: "ethena-staked-usde",
  jlp: "jupiter-perps-lp",
  prime: "echelon-prime",
  ena: "ethena",
  ldo: "lido-dao",
  uni: "uniswap",
  arb: "arbitrum",
  op: "optimism",
  aave: "aave",
  comp: "compound-governance-token",
  mkr: "maker",
  crv: "curve-dao-token",
  link: "chainlink",
  wsteth: "wrapped-steth",
  steth: "staked-ether",
  weeth: "wrapped-eeth",
  ezeth: "renzo-ezeth",
  rseth: "kelp-dao-restaked-eth",
  cbeth: "coinbase-wrapped-staked-eth",
  reth: "rocket-pool-eth",
  gho: "gho",
  eurc: "euro-coin",
  usds: "usds",
  susds: "sUSDS",
  usd0: "usd0",
  "usd0++": "usd0-plus-plus",
  usdm: "mountain-protocol-usd",
  wusdm: "wrapped-usdm",
  reusd: "re-usd",
  falconx: "falconx",
  usd3: "usd3",
  juiced: "juiced",
  "mf-one": "marginfi",
  marginfi: "marginfi",
  usdg: "global-dollar",
};

type CoinGeckoSearchCoin = {
  id: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
};

const cache = new Map<string, { image: string | null; expires: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

async function resolveImage(symbol: string): Promise<string | null> {
  const key = symbol.toLowerCase();

  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.image;

  const staticUrl = STATIC_ICON_MAP[key];
  if (staticUrl) {
    cache.set(key, { image: staticUrl, expires: Date.now() + CACHE_TTL_MS });
    return staticUrl;
  }

  const overrideId = ASSET_ID_OVERRIDES[key];
  const query = overrideId ?? key;

  try {
    const res = await fetch(
      `${COINGECKO_SEARCH_URL}?query=${encodeURIComponent(query)}`,
      { headers: { accept: "application/json" }, next: { revalidate: 60 * 60 * 12 } }
    );

    if (res.ok) {
      const data = (await res.json()) as { coins: CoinGeckoSearchCoin[] };
      let match: CoinGeckoSearchCoin | undefined;
      if (overrideId) {
        match = data.coins.find((c) => c.id === overrideId);
      }
      if (!match) {
        match = data.coins
          .filter((c) => c.symbol.toLowerCase() === key)
          .sort((a, b) => (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity))[0];
      }
      const image = match?.large ?? match?.thumb ?? null;
      if (image) {
        cache.set(key, { image, expires: Date.now() + CACHE_TTL_MS });
        return image;
      }
    }
  } catch {
  }

  const fallbackSlug = overrideId ?? key;
  const fallbackUrl = `https://icons.llama.fi/${encodeURIComponent(fallbackSlug)}.png`;
  cache.set(key, { image: fallbackUrl, expires: Date.now() + CACHE_TTL_MS });
  return fallbackUrl;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  if (!symbol) {
    return NextResponse.json({ error: "missing ?symbol=" }, { status: 400 });
  }

  try {
    const image = await resolveImage(symbol);
    return NextResponse.json(
      { image },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return NextResponse.json({ image: null }, { status: 200 });
  }
}

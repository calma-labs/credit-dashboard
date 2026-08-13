import { NextRequest, NextResponse } from "next/server";

const COINGECKO_SEARCH_URL = "https://api.coingecko.com/api/v3/search";

const STATIC_ICON_MAP: Record<string, string> = {
  "usdc": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png",
  "usdt": "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
  "dai": "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png",
  "pyusd": "https://coin-images.coingecko.com/coins/images/31212/large/PYUSD_Token_Logo_2x.png",
  "usde": "https://coin-images.coingecko.com/coins/images/33613/large/usde.png",
  "susde": "https://coin-images.coingecko.com/coins/images/33669/large/sUSDe.png",
  "usds": "https://coin-images.coingecko.com/coins/images/39926/large/usds.webp",
  "susds": "https://coin-images.coingecko.com/coins/images/39925/large/sUSDS.png",
  "gho": "https://coin-images.coingecko.com/coins/images/30663/large/gho-token-logo.png",
  "frax": "https://coin-images.coingecko.com/coins/images/13422/large/FRAX_icon.png",
  "lusd": "https://coin-images.coingecko.com/coins/images/14666/large/Group_3.png",
  "eurc": "https://coin-images.coingecko.com/coins/images/26045/large/euro-coin.png",
  "crvusd": "https://coin-images.coingecko.com/coins/images/30118/large/crvusd.jpeg",
  "sdai": "https://coin-images.coingecko.com/coins/images/32610/large/sdai.png",
  "usda": "https://coin-images.coingecko.com/coins/images/36098/large/usda.png",
  "dola": "https://coin-images.coingecko.com/coins/images/14287/large/dola.png",
  "fdusd": "https://coin-images.coingecko.com/coins/images/31079/large/firstdigitalusd.jpg",
  "gusd": "https://coin-images.coingecko.com/coins/images/5992/large/gemini-dollar-gusd.png",
  "tusd": "https://coin-images.coingecko.com/coins/images/3449/large/tusd.png",
  "wusdm": "https://coin-images.coingecko.com/coins/images/36429/large/wUSDM.png",
  "jupusd": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png",
  "ausd": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png",
  "syrupusdc": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png",
  "btc": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
  "eth": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
  "sol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  "wbtc": "https://coin-images.coingecko.com/coins/images/7598/large/WBTCLOGO.png",
  "weth": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png",
  "cbbtc": "https://coin-images.coingecko.com/coins/images/40143/large/cbbtc.webp",
  "tbtc": "https://coin-images.coingecko.com/coins/images/11224/large/0x18084fba666a33d37592fa2633fd49a74dd93a88.png",
  "lbtc": "https://coin-images.coingecko.com/coins/images/41207/large/lbtc.webp",
  "steth": "https://coin-images.coingecko.com/coins/images/13442/large/steth_logo.png",
  "wsteth": "https://coin-images.coingecko.com/coins/images/18834/large/wstETH.png",
  "reth": "https://coin-images.coingecko.com/coins/images/20764/large/reth.png",
  "cbeth": "https://coin-images.coingecko.com/coins/images/27008/large/cbeth.png",
  "eeth": "https://coin-images.coingecko.com/coins/images/33059/large/eETH.png",
  "weeth": "https://coin-images.coingecko.com/coins/images/33033/large/weETH.png",
  "ezeth": "https://coin-images.coingecko.com/coins/images/34753/large/ezeth.png",
  "rseth": "https://coin-images.coingecko.com/coins/images/35020/large/rsETH.png",
  "jitosol": "https://coin-images.coingecko.com/coins/images/28046/large/JitoSOL_Token_Logo_Green.png",
  "msol": "https://coin-images.coingecko.com/coins/images/17752/large/mSOL.png",
  "jupsol": "https://coin-images.coingecko.com/coins/images/37151/large/jupsol.png",
  "jlp": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png",
  "jup": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png",
  "morpho": "https://icons.llama.fi/morpho.png",
  "aave": "https://coin-images.coingecko.com/coins/images/12645/large/AAVE.png",
  "comp": "https://coin-images.coingecko.com/coins/images/10775/large/COMP.png",
  "mkr": "https://coin-images.coingecko.com/coins/images/1364/large/Mark_Maker.png",
  "crv": "https://coin-images.coingecko.com/coins/images/12124/large/Curve.png",
  "link": "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  "pst": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  "mglo": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
  "dfdvsol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  "rlusd": "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  "kbtc": "https://coin-images.coingecko.com/coins/images/39902/large/kbtc.png",
  "prime": "https://coin-images.coingecko.com/coins/images/29053/large/prime-logo.png",
  "ena": "https://coin-images.coingecko.com/coins/images/36531/large/ena.png",
  "ldo": "https://coin-images.coingecko.com/coins/images/13573/large/Lido_DAO.png",
  "uni": "https://coin-images.coingecko.com/coins/images/12504/large/uni.jpg",
  "arb": "https://coin-images.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg",
  "op": "https://coin-images.coingecko.com/coins/images/25244/large/Optimism.png",
  "usd0": "https://coin-images.coingecko.com/coins/images/38318/large/usd0.png",
  "usd0++": "https://coin-images.coingecko.com/coins/images/38663/large/usd0__.png",
  "usdm": "https://coin-images.coingecko.com/coins/images/36429/large/wUSDM.png",
  "reusd": "https://coin-images.coingecko.com/coins/images/38981/large/reusd.png",
  "falconx": "https://coin-images.coingecko.com/coins/images/28135/large/falconx.png",
  "usd3": "https://coin-images.coingecko.com/coins/images/37735/large/usd3.png",
  "juiced": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png",
  "mf-one": "https://icons.llama.fi/marginfi.jpg",
  "marginfi": "https://icons.llama.fi/marginfi.jpg",
  "pendle": "https://coin-images.coingecko.com/coins/images/15103/large/Pendle_Logo_Normal.png",
  "xrp": "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  "apx": "https://coin-images.coingecko.com/coins/images/33753/large/APX_Token_Icon.png",
  "inf": "https://icons.llama.fi/sanctum-infinity.jpg",
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
      
      let image = match?.large ?? match?.thumb ?? null;
      if (image && image.includes("coingecko.com")) {
        image = image.replace(/\?[0-9]+$/, "");
      }
      
      cache.set(key, { image, expires: Date.now() + CACHE_TTL_MS });
      return image;
    } else {
      return null;
    }
  } catch {
    return null;
  }
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

"use client";

import React, { useEffect, useState } from "react";

const CHAIN_SLUG_MAP: Record<string, string> = {
  solana: "solana.svg",
  ethereum: "eth.svg",
  base: "base.png",
};

const PROTOCOL_PRIMARY_URLS: Record<string, string> = {
  morpho: "https://icons.llama.fi/morpho.png",
  jupiter: "https://icons.llama.fi/jupiter.jpg",
  save: "https://icons.llama.fi/save.jpg",
  solend: "https://icons.llama.fi/save.jpg",
  kamino: "https://icons.llama.fi/kamino-lend.jpg",
  marginfi: "https://icons.llama.fi/marginfi.jpg",
  aave: "https://icons.llama.fi/aave.jpg",
};

const protocolCache = new Map<string, Promise<string | null>>();
const assetCache = new Map<string, Promise<string | null>>();

function fetchProtocolLogo(name: string): Promise<string | null> {
  const key = name.toLowerCase();
  const primary = PROTOCOL_PRIMARY_URLS[key];
  if (primary) {
    return Promise.resolve(primary);
  }
  let promise = protocolCache.get(key);
  if (!promise) {
    promise = fetch(`/api/icons/protocol?name=${encodeURIComponent(key)}`)
      .then((res) => (res.ok ? res.json() : { logo: null }))
      .then((data) => data.logo as string | null)
      .catch(() => null);
    protocolCache.set(key, promise);
  }
  return promise;
}

const CLIENT_STATIC_ASSET_ICONS: Record<string, string> = {
  "usdc": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "usdt": "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661",
  "dai": "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996",
  "pyusd": "https://coin-images.coingecko.com/coins/images/31212/large/PYUSD_Token_Logo_2x.png?1765987788",
  "usde": "https://coin-images.coingecko.com/coins/images/33613/large/usde.png?1733810059",
  "susde": "https://coin-images.coingecko.com/coins/images/33669/large/sUSDe.png?1733810072",
  "rlusd": "https://coin-images.coingecko.com/coins/images/39563/large/rlusd.png?1723187216",
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
  "wbtc": "https://coin-images.coingecko.com/coins/images/7598/large/WBTCLOGO.png?1764496367",
  "cbbtc": "https://coin-images.coingecko.com/coins/images/40143/large/cbbtc.webp?1726136727",
  "tbtc": "https://coin-images.coingecko.com/coins/images/11224/large/0x18084fba666a33d37592fa2633fd49a74dd93a88.png?1696511155",
  "lbtc": "https://coin-images.coingecko.com/coins/images/41207/large/lbtc.webp?1731044294",
  "kbtc": "https://coin-images.coingecko.com/coins/images/39902/large/kbtc.png?1724754593",
  "eth": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  "weth": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
  "steth": "https://coin-images.coingecko.com/coins/images/13442/large/steth_logo.png?1696513206",
  "wsteth": "https://coin-images.coingecko.com/coins/images/18834/large/wstETH.png?1696518295",
  "reth": "https://coin-images.coingecko.com/coins/images/20764/large/reth.png?1696520159",
  "cbeth": "https://coin-images.coingecko.com/coins/images/27008/large/cbeth.png?1709186989",
  "eeth": "https://coin-images.coingecko.com/coins/images/33059/large/eETH.png?1700199587",
  "weeth": "https://coin-images.coingecko.com/coins/images/33033/large/weETH.png?1701438396",
  "ezeth": "https://coin-images.coingecko.com/coins/images/34753/large/ezeth.png?1713436401",
  "rseth": "https://coin-images.coingecko.com/coins/images/35020/large/rsETH.png?1708404608",
  "sol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "jitosol": "https://coin-images.coingecko.com/coins/images/28046/large/JitoSOL_Token_Logo_Green.png?1779807693",
  "msol": "https://coin-images.coingecko.com/coins/images/17752/large/mSOL.png?1696517269",
  "jupsol": "https://coin-images.coingecko.com/coins/images/37151/large/jupsol.png?1713426027",
  "dfdvsol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "pst": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "jlp": "https://coin-images.coingecko.com/coins/images/35088/large/jlp.png?1709712613",
  "jup": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png?1704266489",
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
  "morpho": "https://coin-images.coingecko.com/coins/images/52011/large/morpho.png?1732098679",
  "aave": "https://coin-images.coingecko.com/coins/images/12645/large/AAVE.png?1696512452",
  "comp": "https://coin-images.coingecko.com/coins/images/10775/large/COMP.png?1696510737",
  "mkr": "https://coin-images.coingecko.com/coins/images/1364/large/Mark_Maker.png?1696502423",
  "crv": "https://coin-images.coingecko.com/coins/images/12124/large/Curve.png?1696511967",
  "link": "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1696502009",
  "usdg": "https://assets.coingecko.com/coins/images/51281/standard/GDN_USDG_Token_200x200.png?1730484111",
  "pendle": "https://coin-images.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png?1696514728",
  "xrp": "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442",
  "apx": "https://coin-images.coingecko.com/coins/images/33753/large/APX_Token_Icon.png?1702951167",
};

const ASSET_LLAMA_OVERRIDES: Record<string, string> = {
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
};

function fetchAssetImage(symbol: string): Promise<string | null> {
  const key = symbol.toLowerCase();
  const staticIcon = CLIENT_STATIC_ASSET_ICONS[key];
  if (staticIcon) {
    return Promise.resolve(staticIcon);
  }
  let promise = assetCache.get(key);
  if (!promise) {
    promise = fetch(`/api/icons/asset?symbol=${encodeURIComponent(key)}`)
      .then((res) => (res.ok ? res.json() : { image: null }))
      .then((data) => {
        let img = data.image as string | null;
        if (!img) {
          if (key.includes("btc")) img = CLIENT_STATIC_ASSET_ICONS["btc"];
          else if (key.includes("eth")) img = CLIENT_STATIC_ASSET_ICONS["eth"];
          else if (key.includes("sol")) img = CLIENT_STATIC_ASSET_ICONS["sol"];
          else if (key.includes("usd")) img = CLIENT_STATIC_ASSET_ICONS["usdc"];
          else if (key.includes("eur")) img = CLIENT_STATIC_ASSET_ICONS["eurc"];
        }
        return img;
      })
      .catch(() => null);
    assetCache.set(key, promise);
  }
  return promise;
}

export function getChainIconUrl(chain: string): string | null {
  const filename = CHAIN_SLUG_MAP[chain.toLowerCase()];
  return filename ? `/chains/${filename}` : null;
}

export function getProtocolIconUrl(protocol: string): string {
  const key = protocol.toLowerCase();
  return PROTOCOL_PRIMARY_URLS[key] ?? `https://icons.llama.fi/${encodeURIComponent(key)}.jpg`;
}

export function getProtocolIconUrls(protocol: string): string[] {
  const key = protocol.toLowerCase();
  const primary = PROTOCOL_PRIMARY_URLS[key];
  const urls: string[] = [];
  if (primary) urls.push(primary);
  urls.push(`https://icons.llama.fi/${encodeURIComponent(key)}.jpg`);
  urls.push(`https://icons.llama.fi/${encodeURIComponent(key)}.png`);
  return Array.from(new Set(urls));
}

function LetterFallback({
  label,
  size,
  rounded = "rounded-full",
  className = "",
}: {
  label: string;
  size: number;
  rounded?: string;
  className?: string;
}) {
  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center ${rounded} bg-[#1e2836] font-bold text-[#c7cdd8] shadow-sm ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.floor(size * 0.45)) }}
    >
      {label[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

export function ProtocolIcon({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIndex(0);
    setLoading(true);
    const key = name.toLowerCase();
    const list = getProtocolIconUrls(name);
    fetchProtocolLogo(name).then((logo) => {
      if (cancelled) return;
      const finalUrls = logo ? [logo, ...list.filter((u) => u !== logo)] : list;
      setUrls(finalUrls);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (loading && urls.length === 0) {
    return <span className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  if (index >= urls.length || urls.length === 0) {
    return <LetterFallback label={name} size={size} rounded="rounded" className={className} />;
  }

  return (
    <img
      key={urls[index]}
      src={urls[index]}
      alt={name}
      loading="eager"
      decoding="async"
      className={`shrink-0 rounded object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

export function ChainIcon({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const iconUrl = getChainIconUrl(name);

  if (error || !iconUrl) {
    return (
      <span
        className={`shrink-0 inline-block rounded-full bg-[#556677] ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      key={iconUrl}
      src={iconUrl}
      alt={name}
      loading="eager"
      decoding="async"
      className={`shrink-0 rounded-full object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}

export function AssetIcon({
  name,
  size = 28,
  className = "",
  priority = "normal",
}: {
  name: string;
  size?: number;
  className?: string;
  priority?: "high" | "normal" | "low";
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIndex(0);
    setLoading(true);
    const key = name.toLowerCase();
    const staticIcon = CLIENT_STATIC_ASSET_ICONS[key];
    const llamaSlug = ASSET_LLAMA_OVERRIDES[key] ?? key;
    const fallbackLlamaPng = `https://icons.llama.fi/${encodeURIComponent(llamaSlug)}.png`;
    const fallbackLlamaJpg = `https://icons.llama.fi/${encodeURIComponent(llamaSlug)}.jpg`;
    const fallbackLlamaRawPng = `https://icons.llama.fi/${encodeURIComponent(key)}.png`;
    const fallbackLlamaRawJpg = `https://icons.llama.fi/${encodeURIComponent(key)}.jpg`;
    let heuristics: string[] = [];
    if (key.startsWith("pt-") || key.startsWith("yt-")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["pendle"], "https://icons.llama.fi/pendle.jpg", "https://icons.llama.fi/pendle.png");
    else if (key.includes("btc")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["btc"]);
    else if (key.includes("eth")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["eth"]);
    else if (key.includes("sol")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["sol"]);
    else if (["usd", "usdc", "usdt", "dai", "pyusd", "ausd", "jupusd"].includes(key)) heuristics.push(CLIENT_STATIC_ASSET_ICONS["usdc"]);
    else if (key.includes("eur")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["eurc"]);
    else if (key.includes("jup") || key === "jlp" || key === "juiced" || key.includes("jaaa")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["jup"], "https://icons.llama.fi/jupiter.jpg");
    else if (key.includes("mf-") || key === "marginfi") heuristics.push(CLIENT_STATIC_ASSET_ICONS["marginfi"], "https://icons.llama.fi/marginfi.jpg");
    else if (key.includes("usde") || key === "ena" || key === "susde") heuristics.push(CLIENT_STATIC_ASSET_ICONS["usde"]);
    else if (key.includes("rlusd") || key.includes("xrp")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["xrp"], "https://icons.llama.fi/ripple.png", "https://icons.llama.fi/ripple.jpg");
    else if (key.includes("usdt")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["usdt"]);
    else if (key.includes("usdc")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["usdc"]);
    else if (key.includes("apx") || key.includes("apy")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["apx"], "https://icons.llama.fi/apollox.jpg");
    else if (key.includes("savusd")) heuristics.push("https://icons.llama.fi/save.jpg");
    else if (key.includes("reusd") || key.includes("usd3") || key.includes("mwin") || key.includes("msusd") || key.includes("siusd") || key.includes("falconx") || key.includes("srusd") || key.includes("strusd") || key.includes("aznd") || key.includes("mm1") || key.includes("susdat") || key.includes("spyx")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["morpho"], "https://icons.llama.fi/morpho.png");
    else if (key.includes("comp")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["comp"]);
    else if (key.includes("usds")) heuristics.push(CLIENT_STATIC_ASSET_ICONS["susds"], "https://coin-images.coingecko.com/coins/images/39926/large/usds.webp", "https://icons.llama.fi/usds.png", "https://icons.llama.fi/sky-dollar.jpg", CLIENT_STATIC_ASSET_ICONS["dai"]);
    else if (key === "stcc" || key === "cool") heuristics.push(CLIENT_STATIC_ASSET_ICONS["sol"]);
    else if (key === "inf") heuristics.push("https://coin-images.coingecko.com/coins/images/36553/large/inf.png?1711756578", "https://icons.llama.fi/sanctum-infinity.jpg", CLIENT_STATIC_ASSET_ICONS["sol"]);
    else if (key === "usdg") heuristics.push("https://icons.llama.fi/global-dollar.png", "https://icons.llama.fi/global-dollar.jpg", CLIENT_STATIC_ASSET_ICONS["usdg"]);
    else if (key === "usp") heuristics.push(CLIENT_STATIC_ASSET_ICONS["usdc"]);

    fetchAssetImage(name).then((image) => {
      if (cancelled) return;
      const hasHeuristic = heuristics.length > 0;
      const list = [
        staticIcon,
        image,
        ...heuristics,
        ...(hasHeuristic ? [] : [
          fallbackLlamaPng,
          fallbackLlamaJpg,
          fallbackLlamaRawPng,
          fallbackLlamaRawJpg,
        ]),
      ].filter((u): u is string => Boolean(u));
      setUrls(Array.from(new Set(list)));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (loading && urls.length === 0) {
    return <span className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  if (index >= urls.length || urls.length === 0) {
    return <LetterFallback label={name} size={size} className={className} />;
  }

  const fetchPriorityVal = priority === "high" ? "high" : priority === "low" ? "low" : "auto";

  return (
    <img
      key={urls[index]}
      src={urls[index]}
      alt={name}
      loading="eager"
      fetchPriority={fetchPriorityVal}
      decoding="async"
      className={`shrink-0 rounded-full object-contain shadow-sm ${className}`}
      style={{ width: size, height: size }}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

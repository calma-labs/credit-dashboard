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
  "usdc": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png",
  "usdt": "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
  "dai": "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png",
  "pyusd": "https://coin-images.coingecko.com/coins/images/31212/large/PYUSD_Token_Logo_2x.png",
  "usde": "https://coin-images.coingecko.com/coins/images/33613/large/usde.png",
  "susde": "https://coin-images.coingecko.com/coins/images/33669/large/sUSDe.png",
  "rlusd": "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
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
  "wbtc": "https://coin-images.coingecko.com/coins/images/7598/large/WBTCLOGO.png",
  "cbbtc": "https://coin-images.coingecko.com/coins/images/40143/large/cbbtc.webp",
  "tbtc": "https://coin-images.coingecko.com/coins/images/11224/large/0x18084fba666a33d37592fa2633fd49a74dd93a88.png",
  "lbtc": "https://coin-images.coingecko.com/coins/images/41207/large/lbtc.webp",
  "kbtc": "https://coin-images.coingecko.com/coins/images/39902/large/kbtc.png",
  "eth": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
  "weth": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png",
  "steth": "https://coin-images.coingecko.com/coins/images/13442/large/steth_logo.png",
  "wsteth": "https://coin-images.coingecko.com/coins/images/18834/large/wstETH.png",
  "reth": "https://coin-images.coingecko.com/coins/images/20764/large/reth.png",
  "cbeth": "https://coin-images.coingecko.com/coins/images/27008/large/cbeth.png",
  "eeth": "https://coin-images.coingecko.com/coins/images/33059/large/eETH.png",
  "weeth": "https://coin-images.coingecko.com/coins/images/33033/large/weETH.png",
  "ezeth": "https://coin-images.coingecko.com/coins/images/34753/large/ezeth.png",
  "rseth": "https://coin-images.coingecko.com/coins/images/35020/large/rsETH.png",
  "sol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  "jitosol": "https://coin-images.coingecko.com/coins/images/28046/large/JitoSOL_Token_Logo_Green.png",
  "msol": "https://coin-images.coingecko.com/coins/images/17752/large/mSOL.png",
  "jupsol": "https://coin-images.coingecko.com/coins/images/37151/large/jupsol.png",
  "dfdvsol": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  "pst": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  "jlp": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png",
  "jup": "https://coin-images.coingecko.com/coins/images/34188/large/jup.png",
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
  "morpho": "https://icons.llama.fi/morpho.png",
  "aave": "https://coin-images.coingecko.com/coins/images/12645/large/AAVE.png",
  "comp": "https://coin-images.coingecko.com/coins/images/10775/large/COMP.png",
  "mkr": "https://coin-images.coingecko.com/coins/images/1364/large/Mark_Maker.png",
  "crv": "https://coin-images.coingecko.com/coins/images/12124/large/Curve.png",
  "link": "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  "usdg": "https://assets.coingecko.com/coins/images/51281/standard/GDN_USDG_Token_200x200.png",
  "pendle": "https://coin-images.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png",
  "xrp": "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  "apx": "https://coin-images.coingecko.com/coins/images/33753/large/APX_Token_Icon.png",
  "inf": "https://icons.llama.fi/sanctum-infinity.jpg",
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
      const list = [
        staticIcon,
        image,
        ...heuristics,
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

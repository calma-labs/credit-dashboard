"use client";

import React, { useState, useEffect } from "react";

const PROTOCOL_PRIMARY_URLS: Record<string, string> = {
  morpho: "https://icons.llama.fi/morpho.png",
  jupiter: "https://icons.llama.fi/jupiter.jpg",
  save: "https://icons.llama.fi/solend.jpg",
  solend: "https://icons.llama.fi/solend.jpg",
  kamino: "https://icons.llama.fi/kamino-lend.jpg",
  marginfi: "https://icons.llama.fi/marginfi.jpg",
};

const PROTOCOL_SLUG_MAP: Record<string, string[]> = {
  kamino: ["kamino-lend", "kamino", "kamino-finance"],
  jupiter: ["jupiter", "jupiter-exchange", "jupiter-aggregator", "jupiter-lend", "jup"],
  save: ["solend", "save", "save-finance"],
  solend: ["solend", "save"],
  morpho: ["morpho", "morpho-blue", "morpho-aave-v3", "morpho-compound", "morpho-optimizers"],
  marginfi: ["marginfi"],
};

const CHAIN_SLUG_MAP: Record<string, string> = {
  solana: "solana.svg",
  ethereum: "eth.svg",
  base: "base.png",
};

const ASSET_SLUG_MAP: Record<string, string[]> = {
  'usdc':      ['usdc', 'usd-coin'],
  'usdt':      ['usdt', 'tether'],
  'sol':       ['sol', 'solana'],
  'eth':       ['eth', 'ethereum'],
  'weth':      ['weth', 'ethereum'],
  'btc':       ['btc', 'bitcoin'],
  'wbtc':      ['wbtc', 'wrapped-bitcoin', 'bitcoin'],
  'cbbtc':     ['cbbtc', 'coinbase-bridge'],
  'dai':       ['dai', 'maker'],
  'pyusd':     ['pyusd', 'paypal-usd'],
  'jitosol':   ['jitosol', 'jito-staked-sol'],
  'usde':      ['usde', 'ethena-usde'],
  'jlp':       ['jlp', 'jupiter-perps-lp'],
  'jupsol':    ['jupsol', 'jupiter-staked-sol'],
  'dfdvsol':   ['dfdvsol', 'solana'],
  'jupusd':    ['jupusd', 'usd-coin'],
  'ausd':      ['ausd', 'aave-usd'],
  'pst':       ['pst', 'solana'],
  'mglo':      ['mglo', 'ethereum'],
  'eeth':      ['eeth', 'ether-fi-staked-eth'],
  'syrupusdc': ['syrupusdc', 'syrup', 'usd-coin'],
  'morpho':    ['morpho', 'morpho-blue'],
  'msol':      ['msol', 'marinade-staked-sol'],
};

const COINGECKO_STATIC_ICONS: Record<string, string> = {
  "BTC": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
  "ETH": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  "USDT": "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661",
  "USDC": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "SOL": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "WBTC": "https://coin-images.coingecko.com/coins/images/7598/large/WBTCLOGO.png?1764496367",
  "CBBTC": "https://coin-images.coingecko.com/coins/images/40143/large/cbbtc.webp?1726136727",
  "DAI": "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996",
  "WETH": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
  "USDE": "https://coin-images.coingecko.com/coins/images/33613/large/usde.png?1733810059",
  "PYUSD": "https://coin-images.coingecko.com/coins/images/31212/large/PYUSD_Token_Logo_2x.png?1765987788",
  "JITOSOL": "https://coin-images.coingecko.com/coins/images/28046/large/JitoSOL_Token_Logo_Green.png?1779807693",
  "JLP": "https://coin-images.coingecko.com/coins/images/35088/large/jlp.png?1709712613",
  "JUPSOL": "https://coin-images.coingecko.com/coins/images/37151/large/jupsol.png?1713426027",
  "JUPUSD": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "AUSD": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "MSOL": "https://coin-images.coingecko.com/coins/images/17752/large/mSOL.png?1696517269",
  "EETH": "https://coin-images.coingecko.com/coins/images/33059/large/eETH.png?1700199587",
  "MORPHO": "https://coin-images.coingecko.com/coins/images/52011/large/morpho.png?1732098679",
  "PRIME": "https://coin-images.coingecko.com/coins/images/29065/large/PRIME.png?1696528005",
  "PST": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
  "SYRUPUSDC": "https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602",
  "MGLO": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  "DFDVSOL": "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756"
};

export function getProtocolIconUrls(protocol: string): string[] {
  const key = protocol.toLowerCase();
  const urls: string[] = [];
  if (PROTOCOL_PRIMARY_URLS[key]) {
    urls.push(PROTOCOL_PRIMARY_URLS[key]);
  }
  const slugs = PROTOCOL_SLUG_MAP[key] ?? [encodeURIComponent(key)];
  const uniqueSlugs = Array.from(new Set(slugs));
  for (const slug of uniqueSlugs) {
    urls.push(`https://icons.llama.fi/${slug}.png`);
    urls.push(`https://icons.llama.fi/${slug}.jpg`);
  }
  return Array.from(new Set(urls));
}

export function getProtocolIconUrl(protocol: string): string {
  const key = protocol.toLowerCase();
  return PROTOCOL_PRIMARY_URLS[key] ?? getProtocolIconUrls(protocol)[0];
}

export function getChainIconUrl(chain: string): string {
  const key = chain.toLowerCase();
  const filename = CHAIN_SLUG_MAP[key];
  if (filename) {
    return `/chains/${filename}`;
  }
  return `https://icons.llama.fi/${encodeURIComponent(key)}.png`;
}

export function getAssetIconUrls(symbol: string): string[] {
  const key = symbol.toUpperCase();
  const llamaKey = symbol.toLowerCase();

  const urls: string[] = [];

  const cgUrl = COINGECKO_STATIC_ICONS[key];
  if (cgUrl) {
    urls.push(cgUrl);
  }

  const slugs = ASSET_SLUG_MAP[llamaKey] ?? [llamaKey];
  for (const slug of slugs) {
    urls.push(`https://icons.llama.fi/${slug}.png`);
    urls.push(`https://icons.llama.fi/${slug}.jpg`);
  }

  return Array.from(new Set(urls));
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
  const iconUrls = getProtocolIconUrls(name);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [name]);

  if (index >= iconUrls.length) {
    return (
      <span
        className={`shrink-0 inline-flex items-center justify-center rounded bg-[#1e2836] font-bold text-[#c7cdd8] ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(9, Math.floor(size * 0.55)),
        }}
      >
        {name[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }

  return (
    <img
      key={iconUrls[index]}
      src={iconUrls[index]}
      alt={name}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className={`shrink-0 rounded object-contain ${className}`}
      style={{
        width: size,
        height: size,
      }}
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

  if (error) {
    return (
      <span
        className={`shrink-0 inline-block rounded-full bg-[#556677] ${className}`}
        style={{
          width: size,
          height: size,
        }}
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
      style={{
        width: size,
        height: size,
      }}
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
  const iconUrls = getAssetIconUrls(name);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [name]);

  if (index >= iconUrls.length) {
    return (
      <span
        className={`shrink-0 inline-flex items-center justify-center rounded-full bg-[#1e2836] font-bold text-[#c7cdd8] shadow-sm ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(9, Math.floor(size * 0.45)),
        }}
      >
        {name[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }

  const fetchPriorityVal = priority === "high" ? "high" : priority === "low" ? "low" : "auto";

  return (
    <img
      key={iconUrls[index]}
      src={iconUrls[index]}
      alt={name}
      loading="eager"
      fetchPriority={fetchPriorityVal}
      decoding="async"
      className={`shrink-0 rounded-full object-contain shadow-sm ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

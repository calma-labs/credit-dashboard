"use client";

import React, { useState, useEffect } from "react";

const PROTOCOL_SLUG_MAP: Record<string, string[]> = {
  kamino: ["kamino-lend", "kamino"],
  jupiter: ["jupiter", "jupiter-exchange", "jupiter-aggregator", "jupiter-lend", "jup"],
  save: ["solend", "save"],
  solend: ["solend"],
  morpho: ["morpho-blue", "morpho"],
  marginfi: ["marginfi"],
};

const CHAIN_SLUG_MAP: Record<string, string> = {
  solana: "solana.svg",
  ethereum: "eth.svg",
  base: "base.png",
};



export function getProtocolIconUrls(protocol: string): string[] {
  const key = protocol.toLowerCase();
  const slugs = PROTOCOL_SLUG_MAP[key] ?? [encodeURIComponent(key)];
    
  const uniqueSlugs = Array.from(new Set(slugs));
  const urls: string[] = [];
  
  for (const slug of uniqueSlugs) {
    urls.push(`https://icons.llama.fi/${slug}.jpg`);
    urls.push(`https://icons.llama.fi/${slug}.png`);
  }
  
  return urls;
}

export function getProtocolIconUrl(protocol: string): string {
  const urls = getProtocolIconUrls(protocol);
  return urls[0] ?? `https://icons.llama.fi/${encodeURIComponent(protocol.toLowerCase())}.jpg`;
}

export function getChainIconUrl(chain: string): string {
  const key = chain.toLowerCase();
  const filename = CHAIN_SLUG_MAP[key];
  if (filename) {
    return `/chains/${filename}`;
  }
  return `https://icons.llama.fi/${encodeURIComponent(key)}.png`;
}

export function ProtocolIcon({
  name,
  size = 18,
  className,
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
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          background: "#1e2836",
          flex: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(9, Math.floor(size * 0.55)),
          fontWeight: 700,
          color: "#c7cdd8",
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
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        objectFit: "contain",
        flex: "none",
      }}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

export function ChainIcon({
  name,
  size = 14,
  className,
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
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#556677",
          flex: "none",
          display: "inline-block",
        }}
      />
    );
  }

  return (
    <img
      src={iconUrl}
      alt={name}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "contain",
        flex: "none",
      }}
      onError={() => setError(true)}
    />
  );
}

export function getAssetIconUrls(symbol: string): string[] {
  const key = symbol.toLowerCase();
  const overrides: Record<string, string[]> = {
    'cbbtc': ['https://icons.llama.fi/coinbase-bridge.jpg'],
    'jitosol': ['https://icons.llama.fi/jito.jpg'],
    'pyusd': ['https://assets.coincap.io/assets/icons/pyusd@2x.png'],
    'usde': ['https://icons.llama.fi/ethena-usde.jpg'],
  };
  
  if (overrides[key]) {
    return overrides[key];
  }
  
  return [
    `https://assets.coincap.io/assets/icons/${key}@2x.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${key}.png`,
  ];
}

export function AssetIcon({
  name,
  size = 28,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const iconUrls = getAssetIconUrls(name);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [name]);

  if (index >= iconUrls.length) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#1e2836",
          flex: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(9, Math.floor(size * 0.45)),
          fontWeight: 700,
          color: "#c7cdd8",
          boxShadow: '0 1px 4px rgba(0,0,0,.4)',
        }}
      >
        {name[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }

  return (
    <img
      src={iconUrls[index]}
      alt={name}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "contain",
        flex: "none",
        boxShadow: '0 1px 4px rgba(0,0,0,.4)',
      }}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

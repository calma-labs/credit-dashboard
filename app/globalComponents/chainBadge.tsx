import Image from "next/image";

interface ChainBadgeProps {
  chain: string;
}

const CHAIN_ICONS: Record<string, string> = {
  Solana: "/chains/solana.svg",
  Ethereum: "/chains/eth.svg",
  Base: "/chains/base.png",
};

export default function ChainBadge({ chain }: ChainBadgeProps) {
  const iconSrc = CHAIN_ICONS[chain];

  if (!iconSrc) return null;

  return (
    <Image src={iconSrc} alt={chain} width={50} height={50} title={chain} />
  );
}
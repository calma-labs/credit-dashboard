import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@orca-so/whirlpools-core', '@kamino-finance/klend-sdk', '@kamino-finance/kliquidity-sdk'],
};

export default nextConfig;

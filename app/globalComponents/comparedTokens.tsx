"use client";

import React from "react";
import { StandarizedMetric } from "./globalTypes";
import "../globalStyles/cardStyle.css";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import TableRows from "./tableRows";

interface ComparedTokensProps {
  tokens: StandarizedMetric[];
  lends: string[];
  symbols: string[];
}

export default function ComparedTokens({
  tokens,
  lends,
  symbols,
}: ComparedTokensProps) {
  if (!tokens || !tokens.length) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-background rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Lending</TableHead>
            <TableHead>TVL</TableHead>
            <TableHead>Supply APY</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Borrow Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* mapping symbol and index */}
          {symbols.map((symbol, symbolIndex) => {
            const matchingTokens = tokens.filter(
              (m: any) => m.mintAddress === symbol,
            );

            //tokens appearing only on one lending are skipped
            if (matchingTokens.length <= 1) return null;

            //...this is temporary for printing it's name
            const tokenSymbol = matchingTokens[0];

            return (
              <React.Fragment key={`fragment-${symbol}-${symbolIndex}`}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell
                    colSpan={6}
                    className="font-bold text-base py-3 uppercase tracking-wider text-primary"
                  >
                    <h1>Token: {tokenSymbol.symbol}</h1>
                    <span
                      className="mint-address"
                      onClick={() =>
                        navigator.clipboard.writeText(tokenSymbol.mintAddress)
                      }
                    >
                      Mint: {tokenSymbol.mintAddress.slice(0, 5)}...
                    </span>
                  </TableCell>
                </TableRow>

                {/* adding symbol to tablerow*/}
                {lends.map((lending, lendIndex) => {
                  const matchedMetrics = tokens.filter(
                    (t) => t.mintAddress === symbol && t.lending === lending,
                  );

                  return (
                    <TableRows
                      key={`row-${symbol}-${symbolIndex}-${lending}-${lendIndex}`}
                      metrics={matchedMetrics}
                      lendingName={lending}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

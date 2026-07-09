"use client";

import React, { useState } from "react";
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
import BlankRows from "./blankRows";

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
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(
    new Set([symbols[0]]),
  );

  const toggleExpand = (symbol: string) => {
    setExpandedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  if (!tokens || !tokens.length) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-background rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Lending</TableHead>
            <TableHead>TVL</TableHead>
            <TableHead>Supply APY</TableHead>
            <TableHead>Borrow APY</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Borrow Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {symbols.map((symbol, symbolIndex) => {
            const matchingTokens = tokens.filter(
              (m: any) => m.mintAddress === symbol,
            );

            const tokenSymbol = matchingTokens[0];
            const slicedTokens = matchingTokens.slice(1);

            const isExpanded = expandedTokens.has(symbol);

            return (
              <React.Fragment key={`fragment-${symbol}-${symbolIndex}`}>
                <TableRow
                  className="bg-muted/50 hover:bg-muted/70 cursor-pointer select-none transition-colors"
                  onClick={() => toggleExpand(symbol)}
                >
                  <TableCell
                    colSpan={6}
                    className="font-bold text-base py-3 uppercase tracking-wider text-primary"
                  >
                    <div className="flex justify-between items-center w-full">
                      <h1>
                        {isExpanded ? "▼" : "▲"} Token: {tokenSymbol.symbol}
                      </h1>
                      <span
                        className="mint-address text-xs font-mono normal-case"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(
                            tokenSymbol.mintAddress,
                          );
                        }}
                      >
                        Mint: {tokenSymbol.mintAddress.slice(0, 5)}...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>

                {/* visible rest */}
                {isExpanded && (
                  <TableRows
                    key={`row-${symbol}-${symbolIndex}-slice`}
                    metrics={matchingTokens}
                  />
                )}

                {/* visible rest */}
                {isExpanded && (
                  <BlankRows
                    key={`row-${symbol}-${symbolIndex}-blankrow`}
                    metrics={matchingTokens}
                    lendingName={lends}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

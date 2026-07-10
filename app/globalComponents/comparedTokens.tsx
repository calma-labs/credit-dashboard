"use client";

import React, { useState } from "react";
import Link from "next/link";
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

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace(/^W(?=[A-Z])/, "");
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
            const matchingTokens = tokens
              .filter((m: any) => normalizeSymbol(m.symbol) === symbol)
              .sort((a, b) => b.tvl - a.tvl);

            if (matchingTokens.length <= 1) return null;

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
                    <h1>
                      {isExpanded ? "▼" : "▲"}{" "}
                      <Link
                        href={`/token/${symbol.toLowerCase()}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        Token: {symbol}
                      </Link>
                    </h1>
                  </TableCell>
                </TableRow>

                {isExpanded &&
                  lends.map((lending, lendIndex) => {
                    const matchedMetrics = matchingTokens.filter(
                      (t) => t.lending === lending,
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
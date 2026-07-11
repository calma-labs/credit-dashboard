"use client";

import React, { useState } from "react";
import { StandarizedMetric } from "./globalTypes";
import TokenDrawer from "./TokenDrawer";
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
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

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
    <>
      {selectedSymbol && (
        <TokenDrawer
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}

      <div className="p-4 bg-background rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Lending</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Mint Address</TableHead>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSymbol(symbol);
                          }}
                          style={{
                            background: "none", border: "none", padding: 0,
                            cursor: "pointer", color: "inherit", font: "inherit",
                            textDecoration: "underline",
                          }}
                        >
                          Token: {symbol}
                        </button>
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
    </>
  );
}

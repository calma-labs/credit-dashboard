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

interface ComparedTokensProps {
  tokens: StandarizedMetric[];
  lends: string[];
  symbols: string[];
}

export default function ComparedTokens({
  tokens,
  symbols,
}: ComparedTokensProps) {
  // Stan przechowujący adresy tokenów (symbol/mintAddress), które są aktualnie rozwinięte
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());

  // Funkcja do przełączania widoczności (dodaje lub usuwa adres z Set-a)
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
            <TableHead>Utilization</TableHead>
            <TableHead>Borrow Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {symbols.map((symbol, symbolIndex) => {
            const matchingTokens = tokens.filter(
              (m: any) => m.mintAddress === symbol,
            );

            if (matchingTokens.length <= 1) return null;

            const tokenSymbol = matchingTokens[0];
            const slicedTokens = matchingTokens.slice(1);

            // Sprawdzamy czy dany token widnieje w stanie jako "rozwinięty"
            const isExpanded = expandedTokens.has(symbol);

            return (
              <React.Fragment key={`fragment-${symbol}-${symbolIndex}`}>
                {/* Wiersz nagłówkowy działa jako przycisk on/off dla reszty rynków */}
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

                {/* ticker */}
                <TableRows
                  key={`row-${symbol}-${symbolIndex}`}
                  metrics={[tokenSymbol]}
                  lendingName={tokenSymbol.lending}
                />

                {/* visible rest */}
                {isExpanded && (
                  <TableRows
                    key={`row-${symbol}-${symbolIndex}-slice`}
                    metrics={slicedTokens}
                    lendingName={""}
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

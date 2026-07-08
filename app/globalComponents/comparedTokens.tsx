"use client";

import React from "react";
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
    return symbol
        .toUpperCase()
        .replace(/^W(?=[A-Z])/, '');
}

export default function ComparedTokens({
  tokens,
  lends,
  symbols,
}: ComparedTokensProps) {
  if (!tokens || !tokens.length) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-background rounded-xl border">
      {symbols.map((symbol, symbolIndex) => {
        const matchingTokens = tokens.filter(
          (m: any) => normalizeSymbol(m.symbol) === symbol,
        );

        if (matchingTokens.length <= 1) return null;

        return (
          <div key={`fragment-${symbol}-${symbolIndex}`} className="mb-8">
            <Link href={`/token/${symbol.toLowerCase()}`}>
              <h1 className="text-2xl font-bold mb-3 text-sky-400">
                {symbol}
              </h1>
            </Link>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Lending</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Mint</TableHead>
                  <TableHead>TVL</TableHead>
                  <TableHead>Supply APY</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Borrow Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lends.map((lending, lendIndex) => {
                  const matchedMetrics = tokens.filter(
                    (t) => normalizeSymbol(t.symbol) === symbol && t.lending === lending,
                  );

                  return (
                    <TableRows
                      key={`row-${symbol}-${symbolIndex}-${lending}-${lendIndex}`}
                      metrics={matchedMetrics}
                      lendingName={lending}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { StandarizedMetric } from "./globalTypes";
import { TableCell, TableRow } from "@/components/ui/table";
import ChainBadge from "./chainBadge";

interface TableRowsProps {
  metrics: StandarizedMetric[];
  lendingName: string;
}

export default function TableRows({ metrics, lendingName }: TableRowsProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <TableRow>
        <TableCell className="font-medium">{lendingName}</TableCell>
        <TableCell className="text-muted-foreground">-</TableCell>
        <TableCell className="text-muted-foreground">-</TableCell>
        <TableCell className="text-muted-foreground">-</TableCell>
        <TableCell className="text-muted-foreground">-</TableCell>
        <TableCell className="text-muted-foreground">-</TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {metrics.map((metric, idx) => (
        <TableRow key={`${metric.lending}-${metric.symbol}-${idx}`}>
          <TableCell className="font-medium">
            {metric.lending} {metrics.length > 1 ? `#${idx + 1}` : ""}
          </TableCell>

          <TableCell>
            <ChainBadge chain={metric.chain} />
          </TableCell>

          <TableCell>
            <span className="mint-address" title={metric.mintAddress}>
              {metric.mintAddress}
            </span>
          </TableCell>

          <TableCell className="data-value">
            ${Number(metric.tvl).toLocaleString('en-US')}
          </TableCell>

          <TableCell className="apy-green">{metric.supplyAPY}%</TableCell>

          <TableCell className="data-value">{metric.utilization}%</TableCell>

          <TableCell className="rate-red">{metric.borrowRate}%</TableCell>
        </TableRow>
      ))}
    </>
  );
}
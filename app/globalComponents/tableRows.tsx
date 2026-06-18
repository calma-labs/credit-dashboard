"use client";

import { StandarizedMetric } from "./globalTypes";
import { TableCell, TableRow } from "@/components/ui/table";

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

          <TableCell className="data-value">
            ${metric.tvl.toLocaleString()}
          </TableCell>

          <TableCell className="apy-green">{metric.supplyAPY}%</TableCell>

          <TableCell className="data-value">{metric.utilization}%</TableCell>

          <TableCell className="rate-red">{metric.borrowRate}%</TableCell>
        </TableRow>
      ))}
    </>
  );
}

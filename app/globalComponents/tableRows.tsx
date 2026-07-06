"use client";

import { StandarizedMetric } from "./globalTypes";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableRowsProps {
  metrics: StandarizedMetric[];
  lendingName: string;
  mintAddress: string;
}

export default function TableRows({ metrics, lendingName }: TableRowsProps) {
  return (
    <>
      {metrics.map((metric, idx) => (
        <TableRow key={`${metric.lending}-${metric.symbol}-${idx}`}>
          <TableCell className="font-medium">{metric.lending}</TableCell>

          <TableCell className="data-value">${metric.tvl}</TableCell>

          <TableCell className="apy-green">{metric.supplyAPY}%</TableCell>

          <TableCell className="data-value">{metric.utilization}%</TableCell>

          <TableCell className="rate-red">{metric.borrowRate}%</TableCell>
        </TableRow>
      ))}
    </>
  );
}
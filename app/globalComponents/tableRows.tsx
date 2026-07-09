"use client";

import { StandarizedMetric } from "./globalTypes";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableRowsProps {
  metrics: StandarizedMetric[];
}

export default function TableRows({ metrics }: TableRowsProps) {
  return (
    <>
      {metrics.map((metric, idx) => (
        <TableRow key={`${metric.lending}-${metric.symbol}-${idx}`}>
          <TableCell className="font-medium">
            {metric.lending}{" "}
            {metric.market.length > 8
              ? `${metric.market.slice(0, 7)}...`
              : ""}
          </TableCell>

          <TableCell className="data-value">
            {metric.tvl.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </TableCell>

          <TableCell className="apy-green">{metric.supplyAPY}%</TableCell>

          <TableCell className="apy-green">{metric.borrowAPY}%</TableCell>

          <TableCell className="data-value">{metric.utilization}%</TableCell>

          <TableCell className="rate-red">{metric.borrowRate}%</TableCell>
        </TableRow>
      ))}
    </>
  );
}

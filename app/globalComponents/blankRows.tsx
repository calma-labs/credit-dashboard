"use client";

import { StandarizedMetric } from "./globalTypes";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableRowsProps {
  metrics: StandarizedMetric[];
  lendingName: string[];
}

export default function TableRows({ metrics, lendingName }: TableRowsProps) {
  if (!metrics || !metrics.length) return null;

  return (
    <>
      {lendingName.map((name, idx) => {
        const metric = metrics.find((m) => m.lending === name);
        if (metric) return null;
        return (
          <TableRow key={`blank-row-${idx}`}>
            <TableCell className="rate-red">{name}</TableCell>
            <TableCell className="rate-red">-</TableCell>

            <TableCell className="rate-red">-</TableCell>

            <TableCell className="rate-red">-</TableCell>

            <TableCell className="rate-red">-</TableCell>

            <TableCell className="rate-red">-</TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

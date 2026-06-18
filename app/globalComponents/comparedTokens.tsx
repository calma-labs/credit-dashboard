'use client';

import Link from "next/link";
import { type MatchedTokens } from "./globalTypes";
import "../globalStyles/cardStyle.css";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableRows from "./tableRows";

export default function ComparedTokens({ tokens }: { tokens: MatchedTokens[] }) {
    if (!tokens || tokens.length === 0) {
        return (<div>Loading...</div>);
    }

    return (
        <div className="flex flex-col gap-8">
            {tokens.map((t: MatchedTokens, index: number) => (
                <div key={index} className="token-pair-table-wrapper">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px] font-bold text-lg">
                                    <Link href={`/token/${t.symbol.toLowerCase()}`} className="hover:text-sky-400 transition-colors">
                                        {t.symbol}
                                    </Link>
                                </TableHead>
                                <TableHead>Mint</TableHead>
                                <TableHead>TVL</TableHead>
                                <TableHead>Supply APY</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Borrow Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                            <TableRows token={t} />
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    );
}
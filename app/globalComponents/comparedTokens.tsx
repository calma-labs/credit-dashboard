'use client';

import { type MatchedTokens } from "./globalTypes";
import "../globalStyles/cardStyle.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// main function 
export default function ComparedTokens({ tokens }: any) {
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
                                    {t.symbol}
                                </TableHead>
                                <TableHead>Mint</TableHead>
                                <TableHead>TVL</TableHead>
                                <TableHead>Supply APY</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Borrow Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                            
                            <TableRow>
                                <TableCell className="font-medium">juplend</TableCell>
                                <TableCell>
                                    <span className="mint-address" title={t.leftSide.mintAddress}>
                                        {t.leftSide.mintAddress}
                                    </span>
                                </TableCell>
                                <TableCell className="data-value">
                                    ${Number(t.leftSide.tvl).toLocaleString()}
                                </TableCell>
                                <TableCell className="apy-green">
                                    {t.leftSide.supplyAPY}%
                                </TableCell>
                                <TableCell className="data-value">
                                    {t.leftSide.utilization}%
                                </TableCell>
                                <TableCell className="rate-red">
                                    {t.leftSide.borrowRate}%
                                </TableCell>
                            </TableRow>

                            
                            <TableRow>
                                <TableCell className="font-medium">kamino</TableCell>
                                <TableCell>
                                    <span className="mint-address" title={t.rightSide.mintAddress}>
                                        {t.rightSide.mintAddress}
                                    </span>
                                </TableCell>
                                <TableCell className="data-value">
                                    ${Number(t.rightSide.tvl).toLocaleString()}
                                </TableCell>
                                <TableCell className="apy-green">
                                    {t.rightSide.supplyAPY}%
                                </TableCell>
                                <TableCell className="data-value">
                                    {t.rightSide.utilization}%
                                </TableCell>
                                <TableCell className="rate-red">
                                    {t.rightSide.borrowRate}%
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    );
}
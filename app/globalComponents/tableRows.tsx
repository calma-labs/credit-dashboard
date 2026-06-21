'use client';

import { type MatchedTokens } from "./globalTypes";
import { TableCell, TableRow } from "@/components/ui/table";

export default function TableRows({ token }: { token: MatchedTokens }) {

  if(!token){
    return (<div><h1>ERROR, SOMETHING WENT WRONG!</h1></div>)
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">kamino</TableCell>
        <TableCell>
          <span className="mint-address" title={token.leftSide.mintAddress}>
            {token.leftSide.mintAddress}
          </span>
        </TableCell>
        <TableCell className="data-value">
          ${Number(token.leftSide.tvl).toLocaleString('en-US')}
        </TableCell>
        <TableCell className="apy-green">
          {token.leftSide.supplyAPY}%
        </TableCell>
        <TableCell className="data-value">
          {token.leftSide.utilization}%
        </TableCell>
        <TableCell className="rate-red">
          {token.leftSide.borrowRate}%
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell className="font-medium">juplend</TableCell>
        <TableCell>
          <span className="mint-address" title={token.rightSide.mintAddress}>
            {token.rightSide.mintAddress}
          </span>
        </TableCell>
        <TableCell className="data-value">
          ${Number(token.rightSide.tvl).toLocaleString('en-US')}
        </TableCell>
        <TableCell className="apy-green">
          {token.rightSide.supplyAPY}%
        </TableCell>
        <TableCell className="data-value">
          {token.rightSide.utilization}%
        </TableCell>
        <TableCell className="rate-red">
          {token.rightSide.borrowRate}%
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell className="font-medium">save</TableCell>
        <TableCell>
          <span className="mint-address" title={token.saveSide.mintAddress}>
            {token.saveSide.mintAddress}
          </span>
        </TableCell>
        <TableCell className="data-value">
          ${Number(token.saveSide.tvl).toLocaleString('en-US')}
        </TableCell>
        <TableCell className="apy-green">
          {token.saveSide.supplyAPY}%
        </TableCell>
        <TableCell className="data-value">
          {token.saveSide.utilization}%
        </TableCell>
        <TableCell className="rate-red">
          {token.saveSide.borrowRate}%
        </TableCell>
      </TableRow>
    </>
  );
}
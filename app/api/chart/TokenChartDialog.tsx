"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ApyChart } from "./ApyChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PlatformSnapshot {
    protocol: string;
    tvl: number;
    supplyAPY: number;
    borrowRate: number;
    utilization: number;
}

interface TokenDetailProps {
    symbol: string;
    snapshots: PlatformSnapshot[];
}

const PROTOCOLS = ["kamino", "save", "jupiter"];

const getProtocolColor = (protocol: string) =>
    `var(--protocol-${protocol}, var(--protocol-default))`;

export function TokenDetailView({ symbol, snapshots }: TokenDetailProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [datasets, setDatasets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const rangeParam = searchParams.get("range") as '7d' | '1m' | '1y' | 'all';
    const currentRange = ['7d', '1m', '1y', 'all'].includes(rangeParam) ? rangeParam : '1y';

    const handleRangeChange = (newRange: '7d' | '1m' | '1y' | 'all') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", newRange);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        Promise.all(
            PROTOCOLS.map(async protocol => {
                try {
                    const res = await fetch(`/api/chart?symbol=${symbol}&protocol=${protocol}`);
                    const data = await res.json();
                    return { protocol, history: data.history || [] };
                } catch {
                    return { protocol, history: [] };
                }
            })
        ).then(results => {
            if (cancelled) return;
            setDatasets(results.filter(r => r.history.length > 0));
            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [symbol]);

    return (
        <div className="w-full min-h-screen bg-dash-bg text-white font-sans">
            <div className="flex items-center gap-4 border-b border-dash-border bg-dash-bg px-8 py-[18px]">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    size="sm"
                    className="border-dash-border bg-dash-accent px-4 text-slate-400 uppercase tracking-[0.05em] hover:bg-dash-accent/80 hover:text-slate-200 transition-colors"
                >
                    ← Back
                </Button>
                <h1 className="m-0 text-[22px] font-extrabold uppercase tracking-[0.12em] text-white">
                    <span className="text-sky-400">{symbol}</span> LENDING METRICS
                </h1>
                <Badge
                    variant="outline"
                    className="rounded-[4px] border-dash-border bg-dash-accent px-3 py-[3px] text-[11px] uppercase tracking-[0.1em] text-sky-400"
                >
                    Lending Comparison
                </Badge>
            </div>

            <div className="px-8 py-7">
                {loading ? (
                    <div className="flex flex-col gap-8">
                        <Skeleton className="h-[432px] w-full rounded-xl bg-dash-card border border-dash-border" />
                        <Skeleton className="h-[250px] w-full rounded-xl bg-dash-card border border-dash-border" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        <ApyChart
                            title="Supply APY — All Platforms"
                            dataKey="apy"
                            datasets={datasets}
                            range={currentRange}
                            onRangeChange={handleRangeChange}
                        />

                        <div className="overflow-x-auto rounded-xl border border-dash-border bg-dash-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-2 border-dash-border bg-dash-accent hover:bg-dash-accent">
                                        {['Platform', 'TVL', 'Supply APY', 'Borrow Rate', 'Utilization'].map(h => (
                                            <TableHead
                                                key={h}
                                                className="px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-dash-header"
                                            >
                                                {h}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {snapshots.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={5} className="px-5 py-5 text-[13px] italic text-dash-muted">
                                                No current data available
                                            </TableCell>
                                        </TableRow>
                                    ) : snapshots.map(s => (
                                        <TableRow key={s.protocol} className="border-b border-dash-border hover:bg-dash-accent/50 transition-colors">
                                            <TableCell className="px-5 py-4">
                                                <span
                                                    style={{ color: getProtocolColor(s.protocol) }}
                                                    className="text-[14px] font-bold capitalize tracking-[0.04em]"
                                                >
                                                    {s.protocol}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-[13px] text-dash-text">
                                                ${s.tvl.toLocaleString('en-US')}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-[14px] font-semibold text-green-400">
                                                {s.supplyAPY}%
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-[14px] font-semibold text-red-400">
                                                {s.borrowRate}%
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-[13px] text-blue-400">
                                                {s.utilization}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ApyChart } from "./ApyChart";

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

const PROTOCOL_COLORS: Record<string, string> = {
    kamino:  '#38bdf8',
    jupiter: '#c084fc',
    save:    '#4ade80',
    default: '#94a3b8',
};

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
            setDatasets(results.filter(r => r.history.length > 0));
            setLoading(false);
        });
    }, [symbol]);

    return (
        <div style={{ backgroundColor: '#060b14', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }} className="w-full text-white">
            <div style={{ borderBottom: '1px solid #0f1f35', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 16, backgroundColor: '#060b14' }}>
                <button 
                    onClick={() => router.back()}
                    style={{
                        background: 'transparent',
                        border: '1px solid #1a3a5c',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', margin: 0 }}>
                    <span style={{ color: '#38bdf8' }}>{symbol}</span> LENDING METRICS
                </h1>
                <span style={{ background: '#0a1628', border: '1px solid #1a3a5c', borderRadius: '4px', padding: '3px 12px', fontSize: '11px', letterSpacing: '0.1em', color: '#38bdf8', textTransform: 'uppercase' }}>
                    Lending Comparison
                </span>
            </div>

            <div style={{ padding: '28px 32px' }}>
                {loading ? (
                    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e4976', letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' }}>
                        Loading metrics...
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

                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #0f1f35', backgroundColor: '#080f1a' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#0a1628', borderBottom: '2px solid #0f1f35' }}>
                                        {['Platform', 'TVL', 'Supply APY', 'Borrow Rate', 'Utilization'].map(h => (
                                            <th key={h} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#1e4976', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshots.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '20px', color: '#1e4976', fontSize: '13px', fontStyle: 'italic' }}>
                                                No current data available
                                            </td>
                                        </tr>
                                    ) : snapshots.map(s => (
                                        <tr key={s.protocol} style={{ borderBottom: '1px solid #0a1628' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ color: PROTOCOL_COLORS[s.protocol] || PROTOCOL_COLORS.default, fontWeight: 700, fontSize: '14px', textTransform: 'capitalize', letterSpacing: '0.04em' }}>
                                                    {s.protocol}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#e2e8f0', fontSize: '13px' }}>
                                                ${s.tvl.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#4ade80', fontWeight: 600, fontSize: '14px' }}>
                                                {s.supplyAPY}%
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#f87171', fontWeight: 600, fontSize: '14px' }}>
                                                {s.borrowRate}%
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#60a5fa', fontSize: '13px' }}>
                                                {s.utilization}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
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
    chain: string;
}

interface TokenDetailProps {
    symbol: string;
    snapshots: PlatformSnapshot[];
}

const PROTOCOLS = ["kamino", "save", "jupiter", "morpho"];

const PROTOCOL_COLORS: Record<string, string> = {
    kamino:   '#38bdf8',
    jupiter:  '#c084fc',
    save:     '#4ade80',
    morpho:   '#fbc808',
    marginfi: '#fb923c',
};

const CHAIN_COLORS: Record<string, string> = {
    Solana:   '#9945FF',
    Ethereum: '#627EEA',
    Base:     '#0052FF',
};

function formatTVL(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`;
    return `$${tvl}`;
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div style={{
            border: '1px solid #161d29', borderRadius: 12, padding: '12px 14px',
            background: 'rgba(255,255,255,.012)',
        }}>
            <div style={{ fontSize: 11, color: '#8B96A9', marginBottom: 6, fontWeight: 500 }}>{label}</div>
            <div style={{
                fontFamily: "'Geist Mono', monospace", fontSize: 18,
                fontWeight: 700, color: color ?? '#EEF1F6',
            }}>{value}</div>
        </div>
    );
}

function ChainCell({ chain }: { chain: string }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#8B96A9' }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: CHAIN_COLORS[chain] ?? '#556', flex: 'none',
            }} />
            {chain}
        </span>
    );
}

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

        return () => { cancelled = true; };
    }, [symbol]);

    const bestSupplyAPY = snapshots.length > 0
        ? Math.max(...snapshots.map(s => s.supplyAPY))
        : null;
    const totalTVL = snapshots.reduce((sum, s) => sum + s.tvl, 0);
    const avgUtil = snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + s.utilization, 0) / snapshots.length
        : null;

    return (
        <div style={{ minHeight: '100vh', background: '#0A0E17', color: '#EEF1F6' }}>

            {/* Sticky top bar */}
            <div style={{
                height: 60, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 28px',
                borderBottom: '1px solid #161d29', position: 'sticky', top: 0, zIndex: 5,
                background: 'rgba(10,14,23,.82)', backdropFilter: 'blur(12px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            height: 36, padding: '0 14px', borderRadius: 9,
                            border: '1px solid #232c3d', background: 'rgba(255,255,255,.02)',
                            color: '#8B96A9', fontSize: 13, fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        ← Back
                    </button>
                    <div style={{ height: 16, width: 1, background: '#232c3d' }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: '#4FE3C1' }}>
                            {symbol}
                        </span>
                        <span style={{ fontSize: 13, color: '#8B96A9', fontWeight: 500 }}>
                            Lending Markets
                        </span>
                    </div>
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: '#5C6577' }}>
                    {snapshots.length} protocol{snapshots.length !== 1 ? 's' : ''} tracked
                </div>
            </div>

            {/* Page content */}
            <div style={{ padding: '28px 28px 60px' }}>

                {/* Stats grid */}
                {snapshots.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 10, marginBottom: 20,
                    }}>
                        <StatCard
                            label="Best Supply APY"
                            value={bestSupplyAPY !== null ? `${bestSupplyAPY.toFixed(2)}%` : '—'}
                            color="#4FE3C1"
                        />
                        <StatCard
                            label="Total TVL"
                            value={totalTVL > 0 ? formatTVL(totalTVL) : '—'}
                        />
                        <StatCard
                            label="Avg. Utilization"
                            value={avgUtil !== null ? `${avgUtil.toFixed(1)}%` : '—'}
                        />
                    </div>
                )}

                {/* Chart */}
                {loading ? (
                    <div style={{
                        height: 280, borderRadius: 14, border: '1px solid #161d29',
                        background: 'rgba(255,255,255,.012)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#5C6577', fontSize: 13, marginBottom: 16,
                    }}>
                        Loading chart data…
                    </div>
                ) : (
                    <ApyChart
                        datasets={datasets}
                        range={currentRange}
                        onRangeChange={handleRangeChange}
                    />
                )}

                {/* Protocol breakdown table */}
                {snapshots.length > 0 && (
                    <div style={{
                        border: '1px solid #161d29', borderRadius: 14,
                        overflow: 'hidden', background: 'rgba(255,255,255,.008)',
                        marginTop: 16,
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
                            <thead>
                                <tr>
                                    {['Protocol', 'Chain', 'TVL', 'Supply APY', 'Borrow Rate', 'Utilization'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 16px', textAlign: 'left',
                                            fontSize: 11, fontWeight: 600, color: '#6b7688',
                                            fontFamily: "'Geist Mono', monospace",
                                            letterSpacing: '.04em', textTransform: 'uppercase',
                                            borderBottom: '1px solid #161d29', whiteSpace: 'nowrap',
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {snapshots.map(s => (
                                    <tr
                                        key={s.protocol}
                                        style={{ borderBottom: '1px solid #10151f', transition: 'background .12s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,227,193,.055)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    width: 8, height: 8, borderRadius: 2, flex: 'none',
                                                    background: PROTOCOL_COLORS[s.protocol] ?? '#556',
                                                }} />
                                                <span style={{ fontWeight: 600, fontSize: 13.5, textTransform: 'capitalize', color: '#EEF1F6' }}>
                                                    {s.protocol}
                                                </span>
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                            <ChainCell chain={s.chain} />
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, fontWeight: 600, color: '#EEF1F6' }}>
                                            {formatTVL(s.tvl)}
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, fontWeight: 600, color: '#4FE3C1' }}>
                                            {s.supplyAPY.toFixed(2)}%
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, fontWeight: 500, color: '#c7cdd8' }}>
                                            {s.borrowRate.toFixed(2)}%
                                        </td>
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, color: '#c7cdd8' }}>
                                            {s.utilization.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}

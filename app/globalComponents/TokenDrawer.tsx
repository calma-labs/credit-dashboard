"use client";

import { useState, useEffect } from 'react';
import { ApyChart } from '@/app/api/chart/ApyChart';

const PROTOCOLS = ['kamino', 'save', 'jupiter', 'morpho'];
const AC = '#4FE3C1';

const PROTOCOL_COLORS: Record<string, string> = {
    kamino:   '#38bdf8',
    jupiter:  '#c084fc',
    save:     '#4ade80',
    morpho:   '#fbc808',
    marginfi: '#fb923c',
};

const PROTOCOL_CHAINS: Record<string, string> = {
    kamino:   'Solana',
    save:     'Solana',
    jupiter:  'Solana',
    morpho:   'Ethereum',
    marginfi: 'Solana',
};

const CHAIN_COLORS: Record<string, string> = {
    Solana:   '#9945FF',
    Ethereum: '#627EEA',
};

interface ProtocolData {
    protocol: string;
    chain: string;
    tvl: number;
    supplyAPY: number;
    borrowRate: number;
    utilization: number;
}

interface TokenDrawerProps {
    symbol: string;
    onClose: () => void;
}

function formatTVL(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
    if (tvl >= 1_000_000)     return `$${(tvl / 1_000_000).toFixed(1)}M`;
    if (tvl >= 1_000)         return `$${(tvl / 1_000).toFixed(1)}K`;
    return `$${tvl}`;
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div style={{
            border: '1px solid #161d29', borderRadius: 12,
            padding: '12px 14px', background: 'rgba(255,255,255,.012)',
        }}>
            <div style={{ fontSize: 11, color: '#8B96A9', marginBottom: 6, fontWeight: 500 }}>{label}</div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 18, fontWeight: 700, color: color ?? '#EEF1F6' }}>
                {value}
            </div>
        </div>
    );
}

export default function TokenDrawer({ symbol, onClose }: TokenDrawerProps) {
    const [datasets, setDatasets] = useState<any[]>([]);
    const [snapshots, setSnapshots] = useState<ProtocolData[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<'7d' | '1m' | '1y' | 'all'>('1y');

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setDatasets([]);
        setSnapshots([]);

        Promise.all(
            PROTOCOLS.map(async (protocol) => {
                try {
                    const res = await fetch(`/api/chart?symbol=${symbol}&protocol=${protocol}`);
                    const data = await res.json();
                    return { protocol, data };
                } catch {
                    return { protocol, data: {} };
                }
            })
        ).then(results => {
            if (cancelled) return;

            setDatasets(
                results
                    .filter(r => r.data.history?.length > 0)
                    .map(r => ({ protocol: r.protocol, history: r.data.history }))
            );

            setSnapshots(
                results
                    .filter(r => r.data.snapshot)
                    .map(r => ({
                        protocol: r.protocol,
                        chain: PROTOCOL_CHAINS[r.protocol] ?? 'Unknown',
                        tvl:         r.data.snapshot.tvl         ?? 0,
                        supplyAPY:   r.data.snapshot.supplyAPY   ?? 0,
                        borrowRate:  r.data.snapshot.borrowRate  ?? 0,
                        utilization: r.data.snapshot.utilization ?? 0,
                    }))
            );

            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [symbol]);

    const bestSupplyAPY = snapshots.length > 0 ? Math.max(...snapshots.map(s => s.supplyAPY)) : null;
    const totalTVL = snapshots.reduce((sum, s) => sum + s.tvl, 0);
    const avgUtil = snapshots.length > 0
        ? snapshots.reduce((sum, s) => sum + s.utilization, 0) / snapshots.length
        : null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(4,7,12,.62)',
                    backdropFilter: 'blur(3px)',
                    animation: 'cmOverlay .18s ease',
                }}
            />

            {/* Panel */}
            <div style={{
                position: 'relative', width: 480, maxWidth: '94vw',
                height: '100%', overflowY: 'auto',
                background: '#0c1119', borderLeft: '1px solid #1d2635',
                padding: '26px 26px 40px',
                animation: 'cmDrawer .24s cubic-bezier(.2,.8,.2,1)',
                boxShadow: '-20px 0 60px rgba(0,0,0,.5)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                    <div>
                        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: AC }}>
                            {symbol}
                        </div>
                        <div style={{ fontSize: 12, color: '#8B96A9', marginTop: 5 }}>Lending Markets</div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32, height: 32, borderRadius: 9,
                            border: '1px solid #232c3d', background: 'transparent',
                            color: '#8B96A9', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div style={{ color: '#5C6577', fontSize: 13, textAlign: 'center', padding: '48px 0' }}>
                        Loading data…
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        {snapshots.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                                <StatCard
                                    label="Best Supply APY"
                                    value={bestSupplyAPY !== null ? `${bestSupplyAPY.toFixed(2)}%` : '—'}
                                    color={AC}
                                />
                                <StatCard
                                    label="Total TVL"
                                    value={totalTVL > 0 ? formatTVL(totalTVL) : '—'}
                                />
                                <StatCard
                                    label="Avg. Util"
                                    value={avgUtil !== null ? `${avgUtil.toFixed(1)}%` : '—'}
                                />
                            </div>
                        )}

                        {/* Chart */}
                        <ApyChart datasets={datasets} range={range} onRangeChange={setRange} />

                        {/* Protocol breakdown */}
                        {snapshots.length > 0 && (
                            <div style={{
                                border: '1px solid #161d29', borderRadius: 14,
                                overflow: 'hidden', background: 'rgba(255,255,255,.008)', marginTop: 16,
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['Protocol', 'Chain', 'TVL', 'Supply', 'Borrow', 'Util'].map(h => (
                                                <th key={h} style={{
                                                    padding: '10px 12px', textAlign: 'left',
                                                    fontSize: 10, fontWeight: 600, color: '#6b7688',
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
                                                <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                                        <span style={{
                                                            width: 8, height: 8, borderRadius: 2, flex: 'none',
                                                            background: PROTOCOL_COLORS[s.protocol] ?? '#556',
                                                        }} />
                                                        <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize', color: '#EEF1F6' }}>
                                                            {s.protocol}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8B96A9' }}>
                                                        <span style={{
                                                            width: 6, height: 6, borderRadius: '50%', flex: 'none',
                                                            background: CHAIN_COLORS[s.chain] ?? '#556',
                                                        }} />
                                                        {s.chain}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 12.5, fontWeight: 600, color: '#EEF1F6' }}>
                                                    {formatTVL(s.tvl)}
                                                </td>
                                                <td style={{ padding: '12px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 12.5, fontWeight: 600, color: AC }}>
                                                    {s.supplyAPY.toFixed(2)}%
                                                </td>
                                                <td style={{ padding: '12px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 12.5, fontWeight: 500, color: '#c7cdd8' }}>
                                                    {s.borrowRate.toFixed(2)}%
                                                </td>
                                                <td style={{ padding: '12px', verticalAlign: 'middle', fontFamily: "'Geist Mono', monospace", fontSize: 12.5, color: '#c7cdd8' }}>
                                                    {s.utilization.toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {snapshots.length === 0 && datasets.length === 0 && (
                            <div style={{ color: '#5C6577', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                                No data available for {symbol}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

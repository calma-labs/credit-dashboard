"use client";

import { useState, useMemo } from "react";
import { StandarizedMetric } from "./globalTypes";
import TokenDrawer from "./TokenDrawer";

interface Props {
    rows: StandarizedMetric[];
}

type SortKey = 'symbol' | 'lending' | 'tvl' | 'supplyAPY' | 'borrowRate' | 'utilization' | 'lltv' | 'ltv';
type SortDir = 'asc' | 'desc';

const PROTOCOL_COLORS: Record<string, string> = {
    kamino:   '#38bdf8',
    jupiter:  '#c084fc',
    save:     '#4ade80',
    solend:   '#4ade80',
    morpho:   '#fbc808',
    marginfi: '#fb923c',
};

const TOKEN_COLORS: Record<string, string> = {
    USDC:  '#2775CA', USDT: '#26A17B',  DAI:  '#F5AC37',
    SOL:   '#9945FF', ETH:  '#627EEA',  BTC:  '#F7931A',
    WETH:  '#627EEA', WBTC: '#F09242',  CBBTC:'#F7931A',
    PYUSD: '#043CC6', USDE: '#3B3B45',  JITOSOL:'#4FD6B8',
};

const CHAIN_COLORS: Record<string, string> = {
    Solana:   '#9945FF',
    Ethereum: '#627EEA',
    Base:     '#0052FF',
};

function normalizeSymbol(s: string): string {
    return s.toUpperCase().replace(/^W(?=[A-Z])/, '');
}

function utilColor(u: number): string {
    if (u >= 95) return '#F0854A';
    if (u >= 90) return '#F5B851';
    return '#4FE3C1';
}

function formatTVL(tvl: number): string {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(0)}K`;
    return `$${tvl.toFixed(0)}`;
}

function protoColor(name: string): string {
    const key = name.toLowerCase();
    return Object.entries(PROTOCOL_COLORS).find(([k]) => key.includes(k))?.[1] ?? '#556677';
}

interface HeaderCellProps {
    label: string;
    sk?: SortKey;
    align?: 'left' | 'right';
    sortKey: SortKey;
    sortDir: SortDir;
    onSort: (k: SortKey) => void;
}

function HeaderCell({ label, sk, align = 'left', sortKey, sortDir, onSort }: HeaderCellProps) {
    const active = sk !== undefined && sortKey === sk;
    return (
        <th
            onClick={sk ? () => onSort(sk) : undefined}
            style={{
                padding: '12px 16px', textAlign: align,
                fontSize: 11, fontWeight: 600,
                color: active ? '#EEF1F6' : '#6b7688',
                fontFamily: "'Geist Mono', monospace",
                letterSpacing: '.04em', textTransform: 'uppercase',
                cursor: sk ? 'pointer' : 'default', userSelect: 'none',
                whiteSpace: 'nowrap', borderBottom: '1px solid #161d29',
            }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', width: '100%' }}>
                {label}
                {sk && (
                    <span style={{ fontSize: 9, opacity: active ? 1 : 0.3, color: active ? '#4FE3C1' : '#6b7688' }}>
                        {active ? (sortDir === 'asc' ? '▲' : '▼') : '▼'}
                    </span>
                )}
            </span>
        </th>
    );
}

function CollateralBadge({ symbol }: { symbol: string }) {
    const norm = normalizeSymbol(symbol);
    const color = TOKEN_COLORS[norm] ?? '#556677';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${color}18`, border: `1px solid ${color}44`,
            borderRadius: 6, padding: '2px 7px',
            fontSize: 11.5, fontWeight: 600, color,
            fontFamily: "'Geist Mono', monospace",
        }}>
            {norm}
        </span>
    );
}

export default function ComparedTokens({ rows }: Props) {
    const [selected, setSelected]   = useState<string | null>(null);
    const [sortKey, setSortKey]     = useState<SortKey>('tvl');
    const [sortDir, setSortDir]     = useState<SortDir>('desc');

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir(key === 'symbol' || key === 'lending' ? 'asc' : 'desc');
        }
    }

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => {
            if (sortKey === 'symbol')  return normalizeSymbol(a.symbol).localeCompare(normalizeSymbol(b.symbol)) * dir;
            if (sortKey === 'lending') return a.lending.localeCompare(b.lending) * dir;
            if (sortKey === 'lltv') {
                const aVal = a.lltv ?? 0;
                const bVal = b.lltv ?? 0;
                return (aVal - bVal) * dir;
            }
            if (sortKey === 'ltv') {
                const aVal = a.ltv ?? 0;
                const bVal = b.ltv ?? 0;
                return (aVal - bVal) * dir;
            }
            return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
        });
    }, [rows, sortKey, sortDir]);

    const hProps = { sortKey, sortDir, onSort: handleSort };

    return (
        <>
            {selected && (
                <TokenDrawer symbol={selected} onClose={() => setSelected(null)} />
            )}

            <div style={{
                border: '1px solid #161d29', borderRadius: 16,
                overflow: 'hidden', overflowX: 'auto',
                background: 'rgba(255,255,255,.008)',
            }}>
                <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <HeaderCell label="Asset"       sk="symbol"      {...hProps} />
                            <HeaderCell label="Collateral"                   {...hProps} />
                            <HeaderCell label="Protocol"    sk="lending"     {...hProps} />
                            <HeaderCell label="Chain"                        {...hProps} />
                            <HeaderCell label="TVL"         sk="tvl"         align="right" {...hProps} />
                            <HeaderCell label="Supply APY"  sk="supplyAPY"   align="right" {...hProps} />
                            <HeaderCell label="Borrow APY"  sk="borrowRate"  align="right" {...hProps} />
                            <HeaderCell label="Max LTV"     sk="ltv"         align="right" {...hProps} />
                            <HeaderCell label="LLTV"        sk="lltv"        align="right" {...hProps} />
                            <HeaderCell label="Utilization" sk="utilization" {...hProps} />
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ padding: '56px 16px', textAlign: 'center', color: '#5C6577', fontSize: 14 }}>
                                    No markets match your filters.
                                </td>
                            </tr>
                        ) : sorted.map((row, i) => {
                            const sym       = normalizeSymbol(row.symbol);
                            const tkColor   = TOKEN_COLORS[sym] ?? '#556677';
                            const ptColor   = protoColor(row.lending);
                            const uColor    = utilColor(row.utilization);
                            const chainColor = CHAIN_COLORS[row.chain] ?? '#556677';

                            return (
                                <tr
                                    key={i}
                                    onClick={() => setSelected(sym)}
                                    style={{ borderBottom: '1px solid #10151f', cursor: 'pointer', transition: 'background .12s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,227,193,.055)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: tkColor, flex: 'none',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, fontWeight: 700, color: '#fff',
                                                fontFamily: "'Geist Mono', monospace",
                                                boxShadow: '0 1px 4px rgba(0,0,0,.4)',
                                            }}>{sym[0]}</span>
                                            <div style={{ lineHeight: 1.3 }}>
                                                <div style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: '-0.01em' }}>{sym}</div>
                                                {row.market && (
                                                    <div style={{ fontSize: 11, color: '#5C6577', marginTop: 1 }}>{row.market}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                        {row.collateral || row.lending === 'kamino'
                                            ? <CollateralBadge symbol={row.collateral || row.symbol} />
                                            : <span style={{ color: '#3a4251', fontSize: 12 }}>—</span>
                                        }
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                width: 18, height: 18, borderRadius: 5, background: ptColor, flex: 'none',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, fontWeight: 800, color: '#08120c',
                                            }}>{row.lending[0].toUpperCase()}</span>
                                            <span style={{ fontSize: 13, color: '#c7cdd8', fontWeight: 500 }}>{row.lending}</span>
                                        </span>
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#8B96A9' }}>
                                            <span style={{
                                                width: 7, height: 7, borderRadius: '50%', flex: 'none',
                                                background: chainColor,
                                            }} />
                                            {row.chain}
                                        </span>
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, fontWeight: 600 }}>
                                        {formatTVL(row.tvl)}
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, fontWeight: 600, color: '#4FE3C1' }}>
                                        {row.supplyAPY}%
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: "'Geist Mono', monospace", fontSize: 13.5, fontWeight: 500, color: '#F0854A' }}>
                                        {row.borrowRate}%
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#8B96A9' }}>
                                        {row.ltv != null ? `${row.ltv}%` : <span style={{ color: '#3a4251' }}>—</span>}
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#8B96A9' }}>
                                        {row.lltv != null ? `${row.lltv}%` : <span style={{ color: '#3a4251' }}>—</span>}
                                    </td>

                                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                            <div style={{ width: 58, height: 5, borderRadius: 4, background: '#1d2635', overflow: 'hidden', flex: 'none' }}>
                                                <div style={{ width: `${Math.min(row.utilization, 100)}%`, height: '100%', background: uColor, borderRadius: 4 }} />
                                            </div>
                                            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12.5, color: '#c7cdd8' }}>
                                                {row.utilization}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

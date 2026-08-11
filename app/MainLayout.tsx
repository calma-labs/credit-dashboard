'use client';

import { useState, useMemo } from 'react';
import { type StandarizedMetric } from './globalComponents/globalTypes';
import ComparedTokens from './globalComponents/comparedTokens';
import { FilterSelect } from '@/components/ui/filter-select';

interface Stats {
    totalTVL: string;
    protocolCount: number;
    chainCount: number;
    medianAPY: string;
    highestAPY: string;
    highestAPYLabel: string;
}

interface MainLayoutProps {
    tokens: StandarizedMetric[];
    lends: string[];
    symbols: string[];
    chains: string[];
    collaterals: string[];
    stats: Stats;
}

const AC = '#4FE3C1';

const PROTOCOL_COLORS: Record<string, string> = {
    kamino: '#38bdf8',
    jupiter: '#c084fc',
    save: '#4ade80',
    solend: '#4ade80',
    morpho: '#fbc808',
    marginfi: '#fb923c',
};

const CHAIN_COLORS: Record<string, string> = {
    Solana: '#9945FF',
    Ethereum: '#627EEA',
    Base: '#0052FF',
};

function StatCard({
    label,
    value,
    sub,
    accent,
    highlight,
}: {
    label: string;
    value: string;
    sub: string;
    accent?: boolean;
    highlight?: boolean;
}) {
    return (
        <div
            style={{
                border: '1px solid #161d29',
                borderRadius: 14,
                padding: '16px 18px',
                background: highlight
                    ? 'linear-gradient(160deg,rgba(79,227,193,.06),rgba(255,255,255,.01))'
                    : 'rgba(255,255,255,.012)',
            }}
        >
            <div
                style={{
                    fontSize: 11.5,
                    color: '#8B96A9',
                    marginBottom: 8,
                    fontWeight: 500,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "'Geist Mono', monospace",
                    letterSpacing: '-0.02em',
                    color: accent ? AC : '#EEF1F6',
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: 11.5,
                    color: accent ? AC : '#8B96A9',
                    marginTop: 6,
                    fontFamily: "'Geist Mono', monospace",
                }}
            >
                {sub}
            </div>
        </div>
    );
}

export default function MainLayout({
    tokens,
    lends,
    symbols,
    chains,
    collaterals,
    stats,
}: MainLayoutProps) {
    const [search, setSearch] = useState('');
    const [protocol, setProtocol] = useState('All');
    const [chain, setChain] = useState('All');
    const [asset, setAsset] = useState('All');
    const [collateral, setCollateral] = useState('All');

    const rows = useMemo(() => {
        const q = search.toLowerCase().trim();
        return tokens.filter((t) => {
            if (protocol !== 'All' && t.lending !== protocol) return false;
            if (chain !== 'All' && t.chain !== chain) return false;
            if (asset !== 'All' && t.symbol.toUpperCase() !== asset)
                return false;
            if (
                collateral !== 'All' &&
                (t.collateral?.toUpperCase() ?? '') !== collateral
            )
                return false;
            if (
                q &&
                !t.symbol.toLowerCase().includes(q) &&
                !t.lending.toLowerCase().includes(q)
            )
                return false;
            return true;
        });
    }, [tokens, protocol, chain, asset, collateral, search]);

    const shownCount = rows.length;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0A0E17',
                color: '#EEF1F6',
            }}
        >
            {/* ── Topbar ── */}
            <header
                style={{
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 28px',
                    borderBottom: '1px solid #161d29',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: 'rgba(10,14,23,.82)',
                    backdropFilter: 'blur(12px)',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    {/* Wordmark */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <img
                            src='/beaver-finance.png'
                            alt='Beaver Finance'
                            width={34}
                            height={34}
                            style={{
                                width: 34,
                                height: 34,
                                objectFit: 'contain',
                                display: 'block',
                            }}
                        />
                        <div style={{ lineHeight: 1 }}>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                beaver finance
                            </div>
                            <div
                                style={{
                                    fontSize: 9,
                                    color: '#5C6577',
                                    fontFamily: "'Geist Mono', monospace",
                                    letterSpacing: '.08em',
                                    marginTop: 2,
                                }}
                            >
                                LENDING DATA
                            </div>
                        </div>
                    </div>

                    <div
                        style={{ height: 16, width: 1, background: '#232c3d' }}
                    />

                    {/* Live indicator */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: 12,
                            color: '#8B96A9',
                        }}
                    >
                        <span
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: AC,
                                boxShadow: `0 0 10px ${AC}`,
                                animation: 'pulse 1.6s infinite',
                            }}
                        />
                        LIVE DATA
                    </div>

                    <div
                        style={{ height: 16, width: 1, background: '#232c3d' }}
                    />

                    {/* Quick stats */}
                    <div style={{ display: 'flex', gap: 16, fontSize: 12.5 }}>
                        <span style={{ color: '#5C6577' }}>
                            Markets{' '}
                            <span
                                style={{
                                    color: '#EEF1F6',
                                    fontFamily: "'Geist Mono', monospace",
                                    fontWeight: 600,
                                }}
                            >
                                {shownCount}
                            </span>
                        </span>
                        <span style={{ color: '#5C6577' }}>
                            TVL tracked{' '}
                            <span
                                style={{
                                    color: '#EEF1F6',
                                    fontFamily: "'Geist Mono', monospace",
                                    fontWeight: 600,
                                }}
                            >
                                {stats.totalTVL}
                            </span>
                        </span>
                        <span style={{ color: '#5C6577' }}>
                            Median APY{' '}
                            <span
                                style={{
                                    color: AC,
                                    fontFamily: "'Geist Mono', monospace",
                                    fontWeight: 600,
                                }}
                            >
                                {stats.medianAPY}%
                            </span>
                        </span>
                    </div>
                </div>
            </header>

            {/* ── Content ── */}
            <main style={{ padding: '28px 28px 60px' }}>
                {/* Page title row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 20,
                        marginBottom: 22,
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: '0 0 6px',
                                fontSize: 28,
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
                                color: '#EEF1F6',
                            }}
                        >
                            Markets
                        </h1>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13.5,
                                color: '#8B96A9',
                            }}
                        >
                            Compare lending markets across protocols ·{' '}
                            <span style={{ color: '#c7cdd8' }}>
                                {shownCount} shown
                            </span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            style={{
                                height: 38,
                                padding: '0 16px',
                                borderRadius: 9,
                                border: '1px solid #232c3d',
                                background: 'transparent',
                                color: '#c7cdd8',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            ⇄ Compare
                        </button>
                        <button
                            style={{
                                height: 38,
                                padding: '0 16px',
                                borderRadius: 9,
                                border: '1px solid #232c3d',
                                background: 'transparent',
                                color: '#c7cdd8',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            ↓ Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4,1fr)',
                        gap: 14,
                        marginBottom: 22,
                    }}
                >
                    <StatCard
                        label='TVL tracked'
                        value={stats.totalTVL}
                        sub={`${stats.protocolCount} protocols`}
                        highlight
                    />
                    <StatCard
                        label='Protocols tracked'
                        value={String(stats.protocolCount)}
                        sub={`across ${stats.chainCount} chain${stats.chainCount !== 1 ? 's' : ''}`}
                    />
                    <StatCard
                        label='Median supply APY'
                        value={`${stats.medianAPY}%`}
                        sub='stablecoin markets'
                    />
                    <StatCard
                        label='Highest supply APY'
                        value={`${stats.highestAPY}%`}
                        sub={stats.highestAPYLabel}
                        accent
                    />
                </div>

                {/* Filter controls */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Search */}
                    <div
                        style={{
                            position: 'relative',
                            flex: 1,
                            minWidth: 200,
                            maxWidth: 320,
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                left: 13,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#5C6577',
                                fontSize: 14,
                                pointerEvents: 'none',
                            }}
                        >
                            ⌕
                        </span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search assets…'
                            style={{
                                width: '100%',
                                height: 40,
                                padding: '0 14px 0 36px',
                                borderRadius: 10,
                                border: '1px solid #232c3d',
                                background: 'rgba(255,255,255,.02)',
                                color: '#EEF1F6',
                                fontSize: 13,
                                fontFamily: 'inherit',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <FilterSelect
                        value={protocol}
                        onChange={setProtocol}
                        options={[
                            { value: 'All', label: 'All protocols' },
                            ...lends.map((l) => ({
                                value: l,
                                label: l,
                                color:
                                    PROTOCOL_COLORS[l.toLowerCase()] ??
                                    '#556677',
                                swatchShape: 'square' as const,
                            })),
                        ]}
                    />

                    <FilterSelect
                        value={chain}
                        onChange={setChain}
                        options={[
                            { value: 'All', label: 'All chains' },
                            ...chains.map((c) => ({
                                value: c,
                                label: c,
                                color: CHAIN_COLORS[c] ?? '#556677',
                                swatchShape: 'circle' as const,
                            })),
                        ]}
                    />

                    <FilterSelect
                        value={asset}
                        onChange={setAsset}
                        options={[
                            { value: 'All', label: 'All assets' },
                            ...symbols.map((s) => ({ value: s, label: s })),
                        ]}
                    />

                    <FilterSelect
                        value={collateral}
                        onChange={setCollateral}
                        options={[
                            { value: 'All', label: 'All collateral' },
                            ...collaterals.map((c) => ({ value: c, label: c })),
                        ]}
                    />
                </div>

                {/* Table */}
                <ComparedTokens rows={rows} />
            </main>
        </div>
    );
}

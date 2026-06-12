"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoryPoint {
    date: string;
    apy: number;
    utilization?: number;
}

interface PlatformData {
    protocol: string;
    history: HistoryPoint[];
}

interface Props {
    title: string;
    dataKey: 'apy' | 'utilization';
    datasets: PlatformData[];
    range: '7d' | '1m' | '1y' | 'all';
    onRangeChange: (range: '7d' | '1m' | '1y' | 'all') => void;
}

const PLATFORM_COLORS: Record<string, string> = {
    kamino:  '#38bdf8',
    jupiter: '#c084fc',
    save:    '#4ade80',
    marginfi:'#fb923c',
    default: '#94a3b8',
};

export const ApyChart = ({ title, dataKey, datasets, range, onRangeChange }: Props) => {
    const chartData = useMemo(() => {
        if (!datasets || datasets.length === 0) return [];

        let cutoff = new Date(0);
        if (range !== 'all') {
            const days = range === '7d' ? 7 : range === '1m' ? 30 : 365;
            cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
        }

        const timeMap = new Map<string, any>();

        datasets.forEach(({ protocol, history }) => {
            history.forEach((p) => {
                const dateObj = new Date(p.date);
                if (dateObj >= cutoff) {
                    const floored = new Date(dateObj);
                    if (range === '7d') {
                        floored.setMinutes(0, 0, 0);
                    } else {
                        floored.setHours(0, 0, 0, 0);
                    }
                    const timeKey = floored.toISOString();
                    if (!timeMap.has(timeKey)) {
                        timeMap.set(timeKey, { rawDate: floored });
                    }
                    const existing = timeMap.get(timeKey);
                    existing[protocol] = p[dataKey];
                }
            });
        });

        return Array.from(timeMap.values()).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    }, [range, datasets, dataKey]);

    const hasData = chartData.length > 0;

    const formatXAxis = (date: Date) => {
        if (range === 'all') return date.toLocaleDateString('en-US', { year: 'numeric' });
        if (range === '1y') return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const ticks = useMemo(() => {
        if (!hasData) return [];

        const getKey = (date: Date) => {
            if (range === 'all') return String(date.getFullYear());
            if (range === '1y') return `${date.getFullYear()}-${date.getMonth()}`;
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        };

        const seen = new Set<string>();
        const unique = chartData.filter(d => {
            const key = getKey(d.rawDate);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (range === '1m') return unique.filter((_, i) => i % 5 === 0).map(d => d.rawDate);
        return unique.map(d => d.rawDate);
    }, [chartData, range, hasData]);

    return (
        <div style={{ backgroundColor: '#080f1a', borderRadius: '12px', border: '1px solid #0f1f35', padding: '24px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1e4976', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    {title}
                </h2>
                <div style={{ display: 'flex', gap: 6 }}>
                    {(['7d', '1m', '1y', 'all'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => onRangeChange(r)}
                            disabled={!hasData}
                            style={{
                                padding: '4px 14px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                cursor: hasData ? 'pointer' : 'not-allowed',
                                border: range === r ? '1px solid #38bdf8' : '1px solid transparent',
                                background: range === r ? '#060b14' : '#0a1628',
                                color: range === r ? '#38bdf8' : '#1e4976',
                                opacity: !hasData ? 0.5 : 1,
                            }}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', height: 320 }}>
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="rawDate"
                                tick={{ fill: '#1e4976', fontSize: 11, fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 600, letterSpacing: '0.05em' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                tickFormatter={formatXAxis}
                                interval={0}
                                ticks={ticks}
                            />
                            <YAxis
                                tick={{ fill: '#1e4976', fontSize: 11, fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 600 }}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                                labelFormatter={(label) => {
                                    const date = label instanceof Date ? label : new Date(label);
                                    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                }}
                                formatter={(value, name) => [
                                    `${value}%`,
                                    String(name).charAt(0).toUpperCase() + String(name).slice(1)
                                ]}
                                contentStyle={{
                                    backgroundColor: '#080f1a',
                                    borderRadius: '8px',
                                    border: '1px solid #0f1f35',
                                    color: '#fff',
                                    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    fontSize: '13px',
                                }}
                                itemStyle={{ fontWeight: 700, letterSpacing: '0.04em' }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: '20px',
                                    fontSize: '12px',
                                    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
                                    color: '#1e4976',
                                }}
                            />
                            {datasets.map(({ protocol }) => (
                                <Line
                                    key={protocol}
                                    type="monotone"
                                    dataKey={protocol}
                                    name={protocol.charAt(0).toUpperCase() + protocol.slice(1)}
                                    stroke={PLATFORM_COLORS[protocol] || PLATFORM_COLORS.default}
                                    strokeWidth={2.5}
                                    dot={false}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#1e4976', fontSize: '13px', border: '1px dashed #0f1f35', borderRadius: '8px' }}>
                        No historical data available for this timeframe
                    </div>
                )}
            </div>
        </div>
    );
};
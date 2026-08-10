'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';

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
    datasets: PlatformData[];
    range: '7d' | '1m' | '1y' | 'all';
    onRangeChange: (range: '7d' | '1m' | '1y' | 'all') => void;
}

const RANGE_OPTIONS = [
    ['7d', '7D'],
    ['1m', '30D'],
    ['1y', '1Y'],
    ['all', 'All'],
] as const;

const METRIC_OPTIONS = [
    ['apy', 'Supply APY'],
    ['utilization', 'Util'],
] as const;

const chartConfig = {
    kamino: { label: 'Kamino', color: '#38bdf8' },
    jupiter: { label: 'Jupiter', color: '#c084fc' },
    save: { label: 'Save', color: '#4ade80' },
    marginfi: { label: 'MarginFi', color: '#fb923c' },
    morpho: { label: 'Morpho', color: '#fbc808' },
} satisfies ChartConfig;

const AC = '#4FE3C1';

function SegCtl({
    opts,
    val,
    pick,
}: {
    opts: readonly (readonly [string, string])[];
    val: string;
    pick: (v: string) => void;
}) {
    return (
        <div
            style={{
                display: 'inline-flex',
                padding: 2,
                background: 'rgba(255,255,255,.03)',
                border: '1px solid #232c3d',
                borderRadius: 9,
                gap: 2,
            }}
        >
            {opts.map(([k, label]) => (
                <button
                    key={k}
                    onClick={() => pick(k)}
                    style={{
                        height: 26,
                        padding: '0 11px',
                        borderRadius: 7,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 11.5,
                        fontWeight: 600,
                        transition: 'all .12s',
                        background: val === k ? AC : 'transparent',
                        color: val === k ? '#04140f' : '#8B96A9',
                    }}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export const ApyChart = ({ datasets, range, onRangeChange }: Props) => {
    const [metric, setMetric] = useState<'apy' | 'utilization'>('apy');

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
                        timeMap.set(timeKey, {
                            rawDate: floored,
                            timestamp: floored.getTime(),
                        });
                    }
                    const existing = timeMap.get(timeKey);
                    existing[protocol] =
                        metric === 'apy' ? p.apy : p.utilization;
                }
            });
        });

        return Array.from(timeMap.values()).sort(
            (a, b) => a.rawDate.getTime() - b.rawDate.getTime(),
        );
    }, [range, datasets, metric]);

    const hasData = chartData.length > 0;

    const formatXAxis = (date: Date) => {
        if (range === 'all')
            return date.toLocaleDateString('en-US', { year: 'numeric' });
        if (range === '1y')
            return date.toLocaleDateString('en-US', { month: 'short' });
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const ticks = useMemo(() => {
        if (!hasData) return [];
        const getKey = (date: Date) => {
            if (range === 'all') return String(date.getFullYear());
            if (range === '1y')
                return `${date.getFullYear()}-${date.getMonth()}`;
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        };
        const seen = new Set<string>();
        const unique = chartData.filter((d) => {
            const key = getKey(d.rawDate);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        // Keep at most ~6 labels regardless of range to prevent overlap
        if (range === '7d') return unique.map((d) => d.rawDate);
        if (range === '1m')
            return unique.filter((_, i) => i % 6 === 0).map((d) => d.rawDate);
        if (range === '1y')
            return unique.filter((_, i) => i % 3 === 0).map((d) => d.rawDate);
        const step = Math.max(1, Math.ceil(unique.length / 5));
        return unique.filter((_, i) => i % step === 0).map((d) => d.rawDate);
    }, [chartData, range, hasData]);

    const rangeLabel =
        range === '7d'
            ? '7 days ago'
            : range === '1m'
              ? '30 days ago'
              : range === '1y'
                ? '1 year ago'
                : 'all time';
    const metricLabel = metric === 'apy' ? 'Supply APY' : 'Utilization';

    return (
        <div
            style={{
                border: '1px solid #161d29',
                borderRadius: 14,
                padding: '15px 15px 12px',
                background: 'rgba(255,255,255,.012)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 13,
                    flexWrap: 'wrap',
                }}
            >
                <SegCtl
                    opts={METRIC_OPTIONS}
                    val={metric}
                    pick={(v) => setMetric(v as 'apy' | 'utilization')}
                />
                <SegCtl
                    opts={RANGE_OPTIONS}
                    val={range}
                    pick={(v) => onRangeChange(v as '7d' | '1m' | '1y' | 'all')}
                />
            </div>

            <div style={{ height: 220 }}>
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className='h-full w-full'
                    >
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <XAxis
                                dataKey='rawDate'
                                tick={{
                                    fill: '#5C6577',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '0.05em',
                                }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                tickFormatter={formatXAxis}
                                interval={0}
                                ticks={ticks}
                            />
                            <YAxis
                                tick={{
                                    fill: '#5C6577',
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <ChartTooltip
                                cursor={{
                                    stroke: '#232c3d',
                                    strokeWidth: 1,
                                    strokeDasharray: '3 3',
                                }}
                                content={
                                    <ChartTooltipContent
                                        className='bg-dash-card border-dash-border font-sans font-bold text-white'
                                        labelClassName='text-dash-muted'
                                        labelFormatter={(_, payload) => {
                                            const raw =
                                                payload?.[0]?.payload?.rawDate;
                                            if (!raw) return '';
                                            const date =
                                                raw instanceof Date
                                                    ? raw
                                                    : new Date(raw);
                                            if (isNaN(date.getTime()))
                                                return '';
                                            return date.toLocaleDateString(
                                                'en-US',
                                                {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            );
                                        }}
                                        formatter={(value, name) => [
                                            `${value}% ${String(name).charAt(0).toUpperCase() + String(name).slice(1)}`,
                                        ]}
                                    />
                                }
                            />
                            <ChartLegend
                                content={
                                    <ChartLegendContent className='pt-4 text-[11px] font-semibold tracking-widest text-dash-header' />
                                }
                            />
                            {datasets.map(({ protocol }) => (
                                <Line
                                    key={protocol}
                                    type='monotone'
                                    dataKey={protocol}
                                    stroke={`var(--protocol-${protocol}, var(--protocol-default))`}
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#5C6577',
                            fontSize: 13,
                            border: '1px dashed #232c3d',
                            borderRadius: 10,
                        }}
                    >
                        No historical data available for this timeframe
                    </div>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10,
                    color: '#5C6577',
                    fontFamily: "'Geist Mono', monospace",
                    marginTop: 6,
                }}
            >
                <span>{rangeLabel}</span>
                <span>{metricLabel}</span>
                <span>now</span>
            </div>
        </div>
    );
};

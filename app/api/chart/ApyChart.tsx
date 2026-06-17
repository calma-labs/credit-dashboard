"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

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

const RANGE_OPTIONS = ['7d', '1m', '1y', 'all'] as const;

const chartConfig = {
    kamino: { label: "Kamino", color: "var(--protocol-kamino)" },
    jupiter: { label: "Jupiter", color: "var(--protocol-jupiter)" },
    save: { label: "Save", color: "var(--protocol-save)" },
    marginfi: { label: "MarginFi", color: "var(--protocol-marginfi)" },
} satisfies ChartConfig;

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
        <Card className="bg-dash-card border-dash-border p-6 gap-0 font-sans">
            <CardHeader className="grid-cols-[1fr_auto] items-center gap-4 p-0 mb-6">
                <CardTitle className="text-[13px] font-bold text-dash-muted uppercase tracking-[0.1em]">
                    {title}
                </CardTitle>
                <div className="flex gap-1.5">
                    {RANGE_OPTIONS.map((r) => (
                        <Button
                            key={r}
                            size="sm"
                            variant="outline"
                            onClick={() => onRangeChange(r)}
                            disabled={!hasData}
                            className={cn(
                                "h-auto rounded-md px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] border-transparent bg-dash-accent text-dash-muted hover:bg-dash-accent hover:text-sky-400 transition-colors",
                                range === r && "border-sky-400 bg-dash-bg text-sky-400 hover:bg-dash-bg hover:text-sky-400"
                            )}
                        >
                            {r.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="w-full h-80">
                    {hasData ? (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="rawDate"
                                    tick={{ fill: 'var(--color-dash-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    tickFormatter={formatXAxis}
                                    interval={0}
                                    ticks={ticks}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--color-dash-muted)', fontSize: 11, fontWeight: 600 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'var(--color-dash-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={
                                        <ChartTooltipContent
                                            className="bg-dash-card border-dash-border font-sans font-bold"
                                            labelFormatter={(label) => {
                                                const date = label instanceof Date ? label : new Date(label);
                                                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                            }}
                                            formatter={(value, name) => [
                                                `${value}%`,
                                                String(name).charAt(0).toUpperCase() + String(name).slice(1)
                                            ]}
                                        />
                                    }
                                />
                                <ChartLegend 
                                    content={<ChartLegendContent className="pt-4 text-dash-muted font-bold tracking-widest text-xs" />} 
                                />
                                {datasets.map(({ protocol }) => (
                                    <Line
                                        key={protocol}
                                        type="monotone"
                                        dataKey={protocol}
                                        stroke={`var(--color-${protocol})`}
                                        strokeWidth={2.5}
                                        dot={false}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-dash-muted text-[13px] border border-dashed border-dash-border rounded-lg">
                            No historical data available for this timeframe
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
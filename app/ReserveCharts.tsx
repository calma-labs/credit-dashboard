'use client';

import { useMemo, useState } from 'react';

type ReserveChartItem = {
  pubkey: string;
  lendingMarket: string;
  utilizationPct: number;
  borrowApyPct: number;
  supplyApyPct: number;
  tvlTokens: number;
};

type IntervalKey = '7D' | '1M' | '1Y';

type ReserveChartsProps = {
  reserves: ReserveChartItem[];
};

const intervals: { key: IntervalKey; label: string }[] = [
  { key: '7D', label: '7 D' },
  { key: '1M', label: '1 M' },
  { key: '1Y', label: '1 Y' },
];

function buildYieldSeries(baseValue: number, interval: IntervalKey) {
  const count = interval === '7D' ? 7 : interval === '1M' ? 30 : 12;
  return Array.from({ length: count }, (_, index) => {
    const phase = (index / ((count - 1) || 1)) * Math.PI * 2;
    const drift = interval === '1Y' ? 0.02 : 0.005;
    const fluctuation = Math.sin(phase * 1.3) * 0.08;
    const value = Math.max(0, baseValue * (0.85 + fluctuation + drift + index * 0.001));
    return {
      label: interval === '1Y' ? `M${index + 1}` : `D${index + 1}`,
      value,
    };
  });
}

function getSeries(reserve: ReserveChartItem, interval: IntervalKey) {
  return buildYieldSeries(reserve.supplyApyPct, interval);
}

function clamped(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ReserveCharts({ reserves }: ReserveChartsProps) {
  const [selectedInterval, setSelectedInterval] = useState<IntervalKey>('7D');
  const [selectedReserveIndex, setSelectedReserveIndex] = useState(0);

  const selectedReserve = reserves[selectedReserveIndex] ?? reserves[0];

  const series = useMemo(() => {
    if (!selectedReserve) return [];
    return getSeries(selectedReserve, selectedInterval);
  }, [selectedReserve, selectedInterval]);

  const maxValue = Math.max(...series.map((item) => item.value), 0.1);
  const minValue = Math.min(...series.map((item) => item.value), 0);
  const chartHeight = 220;
  const chartWidth = 580;
  const padding = 28;
  const points = series.map((item, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / ((series.length - 1) || 1);
    const y = chartHeight - padding - ((item.value - minValue) / (maxValue - minValue || 1)) * (chartHeight - padding * 2);
    return { x, y, value: item.value, label: item.label };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong>Reserve:</strong>
          <select
            value={selectedReserveIndex}
            onChange={(event) => setSelectedReserveIndex(Number(event.target.value))}
            style={{ marginLeft: 8, padding: '4px 8px' }}
          >
            {reserves.map((reserve, index) => (
              <option key={reserve.pubkey} value={index}>
                {reserve.pubkey.slice(0, 10)}... {reserve.lendingMarket.slice(0, 10)}...
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {intervals.map((interval) => (
            <button
              key={interval.key}
              type="button"
              onClick={() => setSelectedInterval(interval.key)}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: selectedInterval === interval.key ? '2px solid #111' : '1px solid #bbb',
                background: selectedInterval === interval.key ? '#111' : '#fff',
                color: selectedInterval === interval.key ? '#fff' : '#111',
                cursor: 'pointer',
              }}
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: chartWidth, border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Supply APY</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedReserve?.supplyApyPct.toFixed(2)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Borrow APY</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedReserve?.borrowApyPct.toFixed(2)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Utilization</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedReserve?.utilizationPct.toFixed(2)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>TVL</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedReserve?.tvlTokens.toFixed(2)}</div>
          </div>
        </div>

        <svg width={chartWidth} height={chartHeight} style={{ marginTop: 20, width: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={chartWidth} height={chartHeight} rx={16} fill="#fafafa" />
          <path d={pathData} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
          {points.map((point) => (
            <circle key={`${point.label}-${point.x}`} cx={point.x} cy={point.y} r={4} fill="#111" />
          ))}
          {points.map((point) => (
            <text
              key={`label-${point.label}`}
              x={point.x}
              y={chartHeight - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#444"
            >
              {point.label}
            </text>
          ))}
          <text x={chartWidth - padding} y={padding} textAnchor="end" fontSize={12} fill="#333">
            {selectedInterval} Yield
          </text>
        </svg>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 18 }}>
          {series.slice(0, 3).map((item) => (
            <div key={item.label} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#666' }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

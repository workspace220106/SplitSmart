'use client';

import React, { useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStockStore } from '@/store/stockStore';

export default function StockChart({ symbol }: { symbol: string }) {
  const { stocks, fetchHistory } = useStockStore();
  const stock = stocks.find(s => s.symbol === symbol);

  // Fetch fresh candle data when the selected stock changes
  useEffect(() => {
    if (symbol) {
      fetchHistory(symbol);
    }
  }, [symbol, fetchHistory]);

  if (!stock) return null;

  // Build chart data from history
  const data = stock.history.map(point => ({
    time: new Date(point.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: point.price,
    volume: point.volume,
  }));

  const isUp = stock.currentPrice >= stock.previousPrice;
  const changePercent = stock.previousPrice > 0
    ? ((stock.currentPrice - stock.previousPrice) / stock.previousPrice * 100)
    : 0;
  const accentColor = isUp ? '#FFD300' : '#FF0000';

  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.price)) * 0.998 : 0;
  const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.price)) * 1.002 : 100;

  return (
    <div className="w-full h-full bg-black relative group overflow-hidden border border-primary/20">
      {/* HUD: Price & Change */}
      <div className="absolute top-4 left-6 z-20 flex gap-12">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-headline uppercase tracking-[0.3em]">
            {stock.name}
          </span>
          <span className="font-mono text-3xl text-primary font-black drop-shadow-[0_0_10px_rgba(255,211,0,0.3)]">
            {stock.currentPrice > 0 ? stock.currentPrice.toFixed(2) : '—'}{' '}
            <span className="text-xs opacity-50">TK</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-headline uppercase tracking-[0.3em]">Change</span>
          <span className={`font-mono text-2xl ${isUp ? 'text-primary' : 'text-error'} flex items-center gap-2 font-bold`}>
            {isUp ? '+' : ''}{changePercent.toFixed(2)}%
            <span className="material-symbols-outlined text-lg">{isUp ? 'trending_up' : 'trending_down'}</span>
          </span>
        </div>
      </div>

      {/* HUD: Day range */}
      <div className="absolute top-4 right-6 z-20 flex gap-6 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
        <div className="flex flex-col items-end">
          <span>Day High</span>
          <span className="text-primary font-bold text-xs">{stock.dayHigh > 0 ? stock.dayHigh.toFixed(2) : '—'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span>Day Low</span>
          <span className="text-error font-bold text-xs">{stock.dayLow > 0 ? stock.dayLow.toFixed(2) : '—'}</span>
        </div>
      </div>

      {/* Chart or Loading state */}
      {data.length < 2 ? (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.3em]">Loading chart data...</span>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 100, right: 20, left: 20, bottom: 30 }}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 6"
              stroke="#1A1A1A"
            />
            <XAxis
              dataKey="time"
              tick={{ fill: '#555', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#1A1A1A' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={80}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: '#555', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(0)}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                border: '1px solid #FFD300',
                borderRadius: '0',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
              }}
              itemStyle={{ color: '#FFD300' }}
              labelStyle={{ color: '#888', fontSize: '9px', marginBottom: 4 }}
              formatter={(value: any) => [`${Number(value).toFixed(2)} TK`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={accentColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${symbol})`}
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-4 left-6 z-20 flex gap-4 font-mono text-[8px] text-zinc-700 uppercase tracking-widest">
        <span>[{stock.symbol}]</span>
        <span>[{stock.sector}]</span>
        <span>[{data.length} data points]</span>
      </div>
    </div>
  );
}

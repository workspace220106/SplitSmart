'use client';

import React from 'react';
import { useStockStore } from '@/store/stockStore';

export default function StockList({ onSelect, selectedSymbol }: { onSelect: (s: string) => void; selectedSymbol: string }) {
  const { stocks, isLoading } = useStockStore();

  return (
    <div className="bg-surface-container border border-primary/20 flex flex-col h-full bg-black">
      <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-surface-container-low">
        <h3 className="font-headline text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
          Market
        </h3>
        <span className={`font-mono text-[9px] ${isLoading ? 'text-zinc-500' : 'text-secondary'} animate-pulse`}>
          {isLoading ? 'LOADING...' : 'LIVE'}
        </span>
      </div>

      <div className="flex-grow overflow-y-auto">
        {stocks.map((stock) => {
          const isSelected = selectedSymbol === stock.symbol;
          const isUp = stock.currentPrice >= stock.previousPrice;
          const change = stock.previousPrice > 0
            ? ((stock.currentPrice - stock.previousPrice) / stock.previousPrice) * 100
            : 0;

          return (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`w-full text-left p-4 border-b border-primary/5 transition-all group relative ${
                isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-high'
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_8px_rgba(255,211,0,0.8)]"></div>
              )}

              <div className="flex justify-between items-start ml-3">
                <div className="flex flex-col">
                  <span className={`font-headline text-sm font-bold tracking-widest transition-colors ${
                    isSelected ? 'text-primary' : 'text-white group-hover:text-primary'
                  }`}>
                    {stock.symbol}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase truncate max-w-[120px]">
                    {stock.name}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm text-primary font-bold">
                    {stock.currentPrice > 0 ? stock.currentPrice.toFixed(2) : '—'}
                    <span className="text-[8px] opacity-60 ml-1">TK</span>
                  </span>
                  {stock.currentPrice > 0 && (
                    <span className={`font-mono text-[9px] ${isUp ? 'text-primary' : 'text-error'}`}>
                      {isUp ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

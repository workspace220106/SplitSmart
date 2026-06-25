'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useStockStore } from '@/store/stockStore';
import StockList from '@/components/arena/StockList';
import StockChart from '@/components/arena/StockChart';
import AgentTerminal from '@/components/arena/AgentTerminal';
import TradePanel from '@/components/arena/TradePanel';
import AnimatedBackground from '@/components/layout/AnimatedBackground';

export default function ArenaPage() {
  const { fetchPrices, initialize, isLoading, apiError } = useStockStore();
  const [latency, setLatency] = useState(12);
  const [selectedSymbol, setSelectedSymbol] = useState('MSFT');

  useEffect(() => {
    initialize();
    const interval = setInterval(() => {
      fetchPrices();
      setLatency(Math.floor(Math.random() * 8) + 8);
    }, 60000); // Refresh prices every 60s
    return () => clearInterval(interval);
  }, [fetchPrices, initialize]);

  return (
    <div className="min-h-screen bg-black text-white font-body pb-24 md:pb-8 pt-16 relative overflow-hidden">
      <AnimatedBackground />
      <Header />

      <main className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px] mt-4">
        {/* Mobile title */}
        <div className="md:hidden flex flex-col mb-6 border-b border-primary/20 pb-4">
          <h1 className="font-headline text-3xl font-black tracking-tighter text-primary uppercase">
            THE <span className="text-white">ARENA</span>
          </h1>
          <div className="flex gap-4 text-[10px] font-mono text-secondary uppercase mt-2 tracking-widest">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 ${apiError ? 'bg-error' : 'bg-secondary'} animate-pulse`}></span>
              {apiError ? 'OFFLINE' : 'ONLINE'}
            </span>
            <span>SYNC: {latency}MS</span>
          </div>
        </div>

        {/* Desktop title */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h1 className="font-headline text-4xl font-black tracking-tight text-white uppercase italic">
              Arcade <span className="text-primary drop-shadow-[0_0_10px_rgba(255,211,0,0.5)]">Finance</span>
            </h1>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.5em] mt-2 ml-1">
              SPLITSMART - LIVE_MARKET_FEED
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono">
            <div className="flex flex-col items-end">
              <span className="text-zinc-600 uppercase">Status</span>
              <span className={`font-bold ${apiError ? 'text-error' : 'text-primary animate-pulse'}`}>
                {isLoading ? 'LOADING...' : apiError ? 'ERROR' : 'LIVE'}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-zinc-600 uppercase">Latency</span>
              <span className="text-secondary font-bold">{latency}MS</span>
            </div>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 border-2 border-error/40 bg-error/5 font-mono text-xs text-error text-center uppercase tracking-wider">
            {apiError} — Retrying on next cycle...
          </div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* StockList sidebar */}
          <div className="hidden lg:block lg:col-span-3 h-[750px] sticky top-24">
            <StockList onSelect={setSelectedSymbol} selectedSymbol={selectedSymbol} />
          </div>

          {/* Center chart area */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="h-[480px]">
              <StockChart symbol={selectedSymbol} />
            </div>

            {/* Mobile stock selector */}
            <div className="lg:hidden">
              <div className="bg-black p-5 arcade-card-3d arcade-card-3d-primary">
                <h3 className="font-headline text-xs text-primary mb-4 uppercase tracking-[0.3em] font-bold">Select Stock</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {['MSFT', 'TSLA', 'AMZN', 'JPM', 'KO', 'CVX', 'PFE', 'SONY'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSymbol(s)}
                      className={`px-5 py-2.5 font-mono text-xs border-2 transition-all whitespace-nowrap rounded-xl ${
                        s === selectedSymbol
                          ? 'border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(255,211,0,0.2)]'
                          : 'border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar: Trade panel only */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <TradePanel symbol={selectedSymbol} />
            <AgentTerminal />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useStockStore } from '@/store/stockStore';
import { useUserStore } from '@/store/userStore';

export default function PortfolioPage() {
  const { getPortfolio, initialize } = useStockStore();
  const { user } = useUserStore();
  const portfolio = getPortfolio();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-black text-white font-body pb-24 md:pb-8 pt-16 relative overflow-hidden">
      <Header />

      <main className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 max-w-[1200px] mt-4">
        <div className="flex flex-col mb-10 border-l-4 border-primary pl-6 py-2">
          <h1 className="font-headline text-4xl font-black tracking-[0.1em] text-white uppercase italic">
            Asset <span className="text-primary drop-shadow-[0_0_10px_rgba(255,211,0,0.5)]">Manifest</span>
          </h1>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.5em] mt-2">
            Player: {user.name.toUpperCase()} // Level {user.level}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-zinc-900/30 border-2 border-primary/20 p-6 group hover:border-primary/50 transition-all">
            <span className="font-headline text-[9px] text-zinc-500 uppercase tracking-widest block mb-2">Available Tokens</span>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">token</span>
              <span className="font-mono text-3xl text-primary font-black">
                {portfolio.balance.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="bg-zinc-900/30 border-2 border-secondary/20 p-6 group hover:border-secondary/50 transition-all">
            <span className="font-headline text-[9px] text-zinc-500 uppercase tracking-widest block mb-2">Total Net Worth</span>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-xl">account_balance_wallet</span>
              <span className="font-mono text-3xl text-secondary font-black">
                {portfolio.totalValue.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="bg-zinc-900/30 border-2 border-white/10 p-6 md:col-span-2 relative overflow-hidden group">
            <span className="font-headline text-[9px] text-zinc-500 uppercase tracking-widest block mb-2">Total P&L</span>
            <div className="flex items-center gap-10">
              <span className={`font-mono text-3xl font-black ${portfolio.totalProfitLoss >= 0 ? 'text-primary' : 'text-error'}`}>
                {portfolio.totalProfitLoss >= 0 ? '+' : ''}{portfolio.totalProfitLoss.toFixed(2)} TK
              </span>
              {portfolio.holdings.length > 0 && (
                <div className={`px-4 py-1.5 font-mono text-xs border-2 font-bold ${portfolio.totalProfitLoss >= 0 ? 'border-primary text-primary bg-primary/5' : 'border-error text-error bg-error/5'}`}>
                  {portfolio.totalProfitLossPercent.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-black border-2 border-primary/10 overflow-hidden mb-10">
          <div className="p-4 border-b border-primary/10 bg-zinc-900/50 flex justify-between items-center">
            <h3 className="font-headline text-[10px] tracking-[0.3em] text-primary uppercase font-bold">
              Holdings
            </h3>
            <span className="font-mono text-[8px] text-zinc-600">{portfolio.holdings.length} positions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  <th className="p-5">Symbol</th>
                  <th className="p-5">Shares</th>
                  <th className="p-5">Avg Cost</th>
                  <th className="p-5">Current</th>
                  <th className="p-5">Value</th>
                  <th className="p-5 text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {portfolio.holdings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-zinc-600 uppercase tracking-[0.4em] italic text-[10px]">
                      No positions yet — go to the Arena to start trading!
                    </td>
                  </tr>
                ) : (
                  portfolio.holdings.map((h) => (
                    <tr key={h.symbol} className="border-b border-primary/5 hover:bg-zinc-900/40 transition-colors group">
                      <td className="p-5 font-bold text-primary">{h.symbol}</td>
                      <td className="p-5 text-zinc-400">{h.shares.toFixed(2)}</td>
                      <td className="p-5 text-zinc-400">{h.avgBuyPrice.toFixed(2)}</td>
                      <td className="p-5 text-primary">{h.currentPrice.toFixed(2)}</td>
                      <td className="p-5 font-bold text-white">{h.totalValue.toFixed(2)}</td>
                      <td className={`p-5 text-right font-black ${h.profitLoss >= 0 ? 'text-primary' : 'text-error'}`}>
                        {h.profitLoss >= 0 ? '+' : ''}{h.profitLoss.toFixed(2)}
                        <span className="ml-2 font-normal opacity-50 text-[10px]">({h.profitLossPercent.toFixed(2)}%)</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-black border-2 border-secondary/10">
          <div className="p-4 border-b border-secondary/10 bg-secondary/5 font-headline text-[10px] tracking-[0.3em] text-secondary uppercase font-bold">
            Transaction History
          </div>
          <div className="divide-y divide-secondary/10 max-h-[440px] overflow-y-auto">
            {portfolio.transactions.length === 0 ? (
              <div className="p-12 text-center text-zinc-700 font-mono text-[9px] uppercase tracking-[0.5em]">
                No transactions yet
              </div>
            ) : (
              portfolio.transactions.map((tx) => (
                <div key={tx.id} className="p-5 flex justify-between items-center group hover:bg-secondary/5 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className={`w-10 h-10 flex items-center justify-center border-2 ${
                      tx.type === 'buy' ? 'border-primary/50 text-primary' : 'border-error/50 text-error'
                    }`}>
                      <span className="material-symbols-outlined text-sm font-bold">
                        {tx.type === 'buy' ? 'add' : 'remove'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold uppercase tracking-widest">
                        {tx.type.toUpperCase()} {tx.symbol}
                      </span>
                      <span className="font-mono text-[8px] text-zinc-600 uppercase mt-1">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-base font-black text-white">
                      {tx.total.toFixed(2)} <span className="text-[10px] text-primary">TK</span>
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500 mt-1">
                      {tx.shares} shares @ {tx.price.toFixed(2)} TK
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

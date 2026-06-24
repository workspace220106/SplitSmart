'use client';

import React from 'react';
import Link from 'next/link';
import { useStockStore } from '@/store/stockStore';

const AgentHeader = () => {
  const { balance } = useStockStore();

  return (
    <header className="fixed top-0 w-full border-b border-outline/30 flex justify-between items-center px-6 h-16 z-50 bg-surface/90 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
          <span className="text-xl font-bold text-on-surface tracking-tight font-headline">
            SplitSmart <span className="text-primary">Agent</span>
          </span>
        </Link>
        <div className="h-6 w-px bg-outline/50 hidden md:block"></div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-on-surface-variant">
          <Link href="/agent" className="text-primary">Overview</Link>
          <Link href="/portfolio" className="hover:text-on-surface transition-colors">Portfolio</Link>
          <Link href="/arena" className="hover:text-on-surface transition-colors text-xs opacity-60">Exit to Arcade</Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Total Liquidity</span>
          <span className="text-lg font-bold text-on-surface font-mono">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full border border-outline bg-surface-container flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
        </div>
      </div>
    </header>
  );
};

export default AgentHeader;

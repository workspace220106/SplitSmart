'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useStockStore } from '@/store/stockStore';

const Header = () => {
  const { user } = useUserStore();
  const { balance } = useStockStore();
  const pathname = usePathname();

  const navLinks = [
    { href: '/arena', label: 'Arena' },
    { href: '/agent', label: 'Agent' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/missions', label: 'Quests' },
    { href: '/store', label: 'Store' },
    { href: '/split', label: 'Split' },
  ];

  return (
    <header className="fixed top-0 w-full border-b border-primary/20 flex justify-between items-center px-6 h-16 z-50 bg-black/90 backdrop-blur-xl transition-all">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">videogame_asset</span>
        <span className="text-xl font-black text-primary uppercase tracking-wider font-headline">
          SPLIT_SMART
        </span>
      </Link>

      <nav className="hidden md:flex gap-6 font-headline uppercase tracking-widest text-sm">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${
              pathname === link.href
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* Trading Balance */}
        <div className="hidden lg:flex flex-col items-end bg-surface-container-high px-4 py-1 border border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse"></div>
          <span className="font-mono text-[9px] text-primary uppercase tracking-widest">Trading Balance</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">token</span>
            <span className="font-mono text-base text-primary font-bold">
              {balance.toFixed(0)} <span className="text-[10px] opacity-70">TK</span>
            </span>
          </div>
        </div>

        {/* Level */}
        <div className="flex flex-col items-center justify-center p-2 border border-outline-variant/30">
          <span className="font-mono text-[8px] text-secondary uppercase tracking-[0.2em]">Rank</span>
          <span className="font-mono text-xs text-white">LVL_{user.level}</span>
        </div>

        <div className="w-8 h-8 border-2 border-primary bg-surface-container-high flex items-center justify-center cursor-pointer">
          <span className="font-mono text-[10px] text-primary">P1</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'ARENA', icon: 'stadium', path: '/arena' },
    { label: 'AGENT', icon: 'smart_toy', path: '/agent' },
    { label: 'MANIFEST', icon: 'inventory_2', path: '/portfolio' },
    { label: 'QUESTS', icon: 'military_tech', path: '/missions' },
    { label: 'STORE', icon: 'shopping_cart', path: '/store' },
    { label: 'SPLIT', icon: 'call_split', path: '/split' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-black h-20 border-t border-primary/20 font-headline text-[10px] font-bold tracking-tighter shadow-[0_-4px_20px_rgba(255,211,0,0.1)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-75 relative ${
              isActive 
                ? 'text-primary' 
                : 'text-zinc-600 hover:text-white'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-primary shadow-[0_0_10px_rgba(255,211,0,0.8)]"></div>
            )}
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
              {item.icon}
            </span>
            <span className={`mt-1 tracking-[0.1em] ${isActive ? 'scale-110' : ''}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';

const Header = () => {
  const router = useRouter();
  const { user: localUser } = useUserStore();
  const { balance } = useStockStore();
  const { user: authUser, logout } = useAuthStore();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/arena', label: 'Insights', icon: 'show_chart' },
    { href: '/store', label: 'Store', icon: 'storefront' },
    { href: '/portfolio', label: 'Leaderboard', icon: 'emoji_events' },
    { href: '/split', label: 'Debts', icon: 'groups' },
    { href: '/missions', label: 'Rewards', icon: 'redeem' },
  ];

  return (
    <header className="fixed top-0 w-full border-b border-primary/20 flex justify-between items-center px-6 h-16 z-50 bg-black/90 backdrop-blur-xl transition-all">
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="material-symbols-outlined text-primary text-[26px] group-hover:scale-105 transition-transform">videogame_asset</span>
        <span className="text-lg font-black text-primary uppercase tracking-wider font-headline">
          SPLIT SMART
        </span>
      </Link>

      <nav className="hidden lg:flex gap-7 font-body font-medium text-[12px] tracking-wide">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 transition-colors ${
              pathname === link.href
                ? 'text-white font-semibold'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] opacity-70">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        {/* Settings gear */}
        <Link 
          href="/profile" 
          className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Settings & Profile"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </Link>

        {/* Notification bell */}
        <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center relative">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* Profile Badge Pill */}
        <Link 
          href="/profile" 
          className="flex items-center gap-3 bg-zinc-900 border border-zinc-800/80 px-4 py-1.5 rounded-full hover:border-[#00abec]/40 hover:bg-zinc-850 transition-all cursor-pointer select-none group"
        >
          <span className="font-headline text-xs font-bold text-white uppercase tracking-wider group-hover:text-primary transition-colors">
            {authUser?.name || localUser.name || 'Player'}
          </span>
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-black group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[15px] font-bold">person</span>
          </div>
        </Link>

        {/* Sign out button */}
        <button 
          onClick={handleLogout} 
          className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center" 
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

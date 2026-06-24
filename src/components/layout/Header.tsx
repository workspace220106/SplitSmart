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
    { href: '/', label: 'Dashboard', icon: 'home' },
    { href: '/arena', label: 'Insights', icon: 'show_chart' },
    { href: '/store', label: 'Store', icon: 'storefront' },
    { href: '/portfolio', label: 'Leaderboard', icon: 'emoji_events' },
    { href: '/split', label: 'Debts', icon: 'groups' },
    { href: '/missions', label: 'Rewards', icon: 'redeem' },
  ];

  return (
    <header className="fixed top-0 w-full border-b border-primary/20 flex justify-between items-center px-6 h-16 z-50 bg-black/90 backdrop-blur-xl transition-all">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-9 h-9 rounded-full bg-primary flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,211,0,0.25)] group-hover:shadow-[0_0_25px_rgba(255,211,0,0.4)] transition-shadow">
           <div className="absolute top-1/2 right-0 w-5 h-5 bg-black/90 origin-left -translate-y-1/2 rotate-45 scale-x-150 translate-x-1"></div>
        </div>
        <span className="text-[22px] font-black text-white tracking-tight font-headline">
          PAC<span className="text-primary">PAY</span>
        </span>
      </Link>

      <nav className="hidden lg:flex gap-8 font-body font-medium text-[13px] tracking-wide">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 transition-colors ${
              pathname === link.href
                ? 'text-white'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] opacity-80">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        {/* Settings gear */}
        <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        {/* Notification bell */}
        <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center relative">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* Profile Badge Pill */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800/80 px-4 py-1.5 rounded-full select-none">
          <span className="font-headline text-xs font-bold text-white uppercase tracking-wider">
            {authUser?.name || localUser.name || 'Player'}
          </span>
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-black">
            <span className="material-symbols-outlined text-[15px] font-bold">person</span>
          </div>
        </div>

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

'use client';

import React, { useState } from 'react';
import { useSplitStore } from '../store/splitStore';
import { RefreshCw, Layers, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { currentUser, usersList, setCurrentUser } = useSplitStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="border-b border-primary/20 bg-black/95 px-4 py-3 md:px-8 relative z-50">
      {/* Top micro scanline */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-[scan_6s_linear_infinite]"></div>
      
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Brand Link */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary text-black flex h-9 w-9 items-center justify-center rounded-none font-black italic tracking-tighter shadow-[0_0_15px_rgba(255,211,0,0.4)] group-hover:bg-white transition-all">
            <span className="font-mono text-lg font-black">S</span>
          </div>
          <span className="font-mono text-xl font-black italic tracking-tighter text-white">
            SPLIT_<span className="text-primary neon-primary">SMART</span>
          </span>
          <span className="hidden md:inline-block font-mono text-[9px] text-secondary font-bold tracking-[0.2em] uppercase border border-secondary/20 px-2 py-0.5 ml-2">
            P2P_LEDGER_V1.0
          </span>
        </Link>

        {/* Navigation links */}
        <div className="hidden items-center gap-6 font-mono text-xs tracking-wider uppercase md:flex">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-primary" /> SYSTEM_DASHBOARD
          </Link>
          <Link href="/recurring" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-secondary" /> RECURRING_BILLING
          </Link>
        </div>

        {/* User Account Switcher - Cyberpunk themed */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 border border-primary/30 bg-black px-3.5 py-1.5 font-mono text-xs tracking-wider hover:border-primary hover:bg-primary/5 transition-all text-primary"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-5 w-5 rounded-none object-cover border border-primary/40"
              />
            ) : (
              <div className="h-5 w-5 bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                U
              </div>
            )}
            <span className="max-w-[80px] truncate font-bold uppercase">
              {currentUser.name.split(' ')[0]}
            </span>
            <RefreshCw className="h-3 w-3 text-secondary animate-[spin_12s_linear_infinite]" />
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-64 border-2 border-primary bg-black p-3.5 shadow-[0_0_30px_rgba(255,211,0,0.2)] z-40 font-mono text-xs">
                <div className="pb-2.5 border-b border-primary/20 mb-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary">
                    // USER_SWITCH_INTENT
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Toggle active Node to verify split records.
                  </p>
                </div>
                <div className="space-y-1.5">
                  {usersList.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors border ${
                        user.id === currentUser.id
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-transparent text-gray-400 hover:border-secondary hover:text-secondary hover:bg-secondary/5'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-5 w-5 rounded-none object-cover border border-gray-700"
                      />
                      <div className="truncate min-w-0">
                        <p className="truncate font-bold uppercase text-[11px]">{user.name}</p>
                        <p className="truncate text-[8px] text-gray-500">{user.upiId || 'NO_UPI_DEPOSITED'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

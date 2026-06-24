'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function LandingPage() {
  const { user } = useUserStore();
  const { firebaseUser } = useAuthStore();
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState('INITIALIZING PORT CONSOLE...');

  useEffect(() => {
    // If user is already logged in, skip boot sequence
    if (firebaseUser) {
      setBooting(false);
      return;
    }

    const steps = [
      { progress: 10, text: 'LAUNCHING SYSTEM CORE...' },
      { progress: 28, text: 'TESTING RAM MEMORY MATRIX... OK' },
      { progress: 45, text: 'CONNECTING TO PORT 0xSPLIT_ENTRY... OK' },
      { progress: 68, text: 'RESOLVING SPLIT_LEDGER_CORE DEPOSIT... OK' },
      { progress: 85, text: 'DEPOSITING SEED_DATA_NODES... OK' },
      { progress: 100, text: 'BOOTING RETRO TERMINAL... READY' },
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setBootProgress(steps[stepIdx].progress);
        setBootText(steps[stepIdx].text);
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 200);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [firebaseUser]);

  if (booting && !firebaseUser) {
    return (
      <div className="min-h-screen bg-black text-primary font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* CRT Scanline effect */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
        
        <div className="w-full max-w-md border border-primary p-6 space-y-6 relative screen-glow bg-black">
          <div className="flex justify-between items-center text-[10px] uppercase text-zinc-500 border-b border-primary/20 pb-2">
            <span>[SYS_BOOT_SEQUENCE]</span>
            <span>REV_4.2.0_SPLIT</span>
          </div>

          <div className="space-y-2 text-xs uppercase tracking-wider text-left min-h-[96px]">
            <p className="text-zinc-600">// COIN_OP_SYSTEM_V4.2.0</p>
            <p className="text-zinc-400">Memory: 640KB BASE RAM (DETECTED)</p>
            <p className="text-zinc-400">Graphics: CRT-LINE RASTER V-SYNC</p>
            <div className="h-4"></div>
            <p className="font-bold text-primary animate-pulse">{bootText}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full border border-primary/40 bg-zinc-950/50 h-6 p-0.5 flex">
            <div 
              className="bg-primary h-full transition-all duration-200 shadow-[0_0_10px_#FFD300]" 
              style={{ width: `${bootProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-zinc-600">
            <span>LOAD_SECTORS: {bootProgress}%</span>
            <span className="animate-ping font-bold text-secondary">BOOTING...</span>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  if (firebaseUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-body pb-24 md:pb-8 pt-16">
        <Header />
        
        <main className="container mx-auto p-4 md:p-6 max-w-5xl mt-6 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00abec]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Avatar Area */}
            <div className="relative shrink-0 mt-2">
               <div className="w-24 h-24 rounded-full border-[3px] border-zinc-800 overflow-hidden bg-zinc-900">
                  <img src="/avatar_a.png" alt="Profile" className="w-full h-full object-cover" />
               </div>
               {/* LVL Badge */}
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-black font-headline font-black text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border-2 border-[#121212] whitespace-nowrap">
                  <span className="material-symbols-outlined text-[10px]">star</span>
                  LVL {user.level}
               </div>
            </div>

            {/* Profile Details */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2">
               <h2 className="text-xl md:text-2xl font-bold font-headline tracking-wide">{user.name}</h2>
               <p className="text-zinc-500 text-sm italic mt-1 font-body">"Professional Financial Arcade Player"</p>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                  <div className="flex items-center gap-1.5 border border-green-500/30 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                     <span className="material-symbols-outlined text-[14px]">verified_user</span>
                     KYC Verified
                  </div>
                  <div className="flex items-center gap-1.5 border border-zinc-700 bg-zinc-800/50 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                     <span className="material-symbols-outlined text-[14px]">schedule</span>
                     Joined Recently
                  </div>
               </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Vault Balance */}
             <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                   <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">Vault Balance</div>
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                   </div>
                </div>
                <div>
                   <div className="text-4xl font-headline font-black tracking-tight">₹{user.pacTokens}</div>
                </div>
             </div>

             {/* Arcade XP */}
             <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-[#00abec]/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                   <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 group-hover:text-[#00abec] transition-colors">Arcade XP</div>
                   <div className="w-10 h-10 rounded-xl bg-[#00abec]/10 flex items-center justify-center text-[#00abec]">
                      <span className="material-symbols-outlined">stars</span>
                   </div>
                </div>
                <div>
                   <div className="text-4xl font-headline font-black mb-4 tracking-tight">{user.xp} <span className="text-xl text-zinc-600 font-bold">XP</span></div>
                   <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00abec] shadow-[0_0_10px_#00abec]" style={{ width: '45%' }}></div>
                   </div>
                </div>
             </div>

             {/* Achievements */}
             <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-secondary/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                   <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 group-hover:text-secondary transition-colors">Achievements</div>
                   <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">military_tech</span>
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 opacity-50 hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined">egg</span>
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 opacity-50 hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined">shield</span>
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 opacity-50 hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined">diamond</span>
                   </div>
                </div>
             </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  // NOT LOGGED IN MARKETING PAGE
  return (
    <div className="min-h-screen bg-black text-white font-body overflow-hidden flex flex-col items-center justify-center p-6 relative">
      {/* Arcade cabinet background effects */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(255,211,0,0.08)_0%,transparent_70%)] opacity-50"></div>
         {/* Floating bit particles */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-[scan_4s_linear_infinite]"></div>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-4xl">
        <div className="relative mb-8 group">
           <h1 className="font-headline text-7xl md:text-9xl font-black text-primary italic tracking-tight drop-shadow-[0_0_30px_rgba(255,211,0,0.4)] transition-all group-hover:drop-shadow-[0_0_50px_rgba(255,211,0,0.7)]">
             PAC<span className="text-white">PAY</span>
           </h1>
        </div>
        
        <p className="font-body text-zinc-400 text-lg md:text-xl leading-relaxed mb-16 uppercase tracking-[0.2em] max-w-[600px] border-l-2 border-r-2 border-primary/20 px-8">
           The Retro-Futuristic <span className="text-primary font-bold">Token Exchange</span> Matrix for the Elite Gamer.
        </p>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-lg">
           <Link 
             href="/auth" 
             className="flex-1 bg-primary text-black font-headline font-black py-5 text-lg uppercase tracking-[0.3em] hover:bg-white hover:shadow-[0_0_40px_rgba(255,211,0,0.6)] transition-all flex justify-center items-center gap-3 group relative overflow-hidden"
           >
              {/* Internal glow animation */}
              <div className="absolute top-0 -left-1/2 w-1/4 h-full bg-white/20 skew-x-12 translate-x-[-100%] group-hover:animate-shine transition-all"></div>
              START SYSTEM
              <span className="material-symbols-outlined font-bold group-hover:translate-x-2 transition-transform">play_arrow</span>
           </Link>
        </div>

        {/* Footer Technical Overlay */}
        <div className="mt-24 w-full flex flex-col md:flex-row justify-between font-mono text-[9px] text-zinc-700 tracking-[0.3em] border-t border-zinc-900 pt-6 gap-4">
           <div className="flex gap-8">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(255,211,0,0.5)]"></span> NETWORK_STABLE</span>
              <span>BANDWIDTH: 1.2 GB/S</span>
           </div>
           <div className="flex gap-8">
              <span>LOCAL_CLOCK: {new Date().toLocaleTimeString()}</span>
              <span>CORE_REV: 4.2.0_SPLIT</span>
           </div>
        </div>
      </main>

      {/* CRT flicker effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] animate-pulse"></div>
    </div>
  );
}

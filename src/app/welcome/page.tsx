'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function WelcomePage() {
  const { firebaseUser } = useAuthStore();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-black text-white font-body overflow-hidden flex flex-col items-center justify-center p-6 relative ${firebaseUser ? 'pt-20 pb-24 md:pb-8' : ''}`}>
      {firebaseUser && <Header />}
      
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
           <h1 className="font-headline text-6xl md:text-8xl font-black text-primary italic tracking-tight drop-shadow-[0_0_30px_rgba(255,211,0,0.3)] transition-all group-hover:drop-shadow-[0_0_50px_rgba(255,211,0,0.5)]">
             SPLIT<span className="text-white"> SMART</span>
           </h1>
        </div>
        
        <p className="font-body text-zinc-400 text-lg md:text-xl leading-relaxed mb-16 uppercase tracking-[0.2em] max-w-[600px] border-l-2 border-r-2 border-primary/20 px-8">
           The Retro-Futuristic <span className="text-primary font-bold">Token Exchange</span> Matrix for the Elite Gamer.
        </p>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg mt-8">
           <Link 
             href={firebaseUser ? "/arena" : "/auth"} 
             className="flex-1 bg-primary text-black font-headline font-black py-5 text-lg uppercase tracking-[0.3em] hover:bg-white hover:shadow-[0_0_40px_rgba(255,211,0,0.6)] transition-all flex justify-center items-center gap-3 group relative overflow-hidden"
           >
              {/* Internal glow animation */}
              <div className="absolute top-0 -left-1/2 w-1/4 h-full bg-white/20 skew-x-12 translate-x-[-100%] group-hover:animate-shine transition-all"></div>
              {firebaseUser ? "INSERT COIN" : "START SYSTEM"}
              <span className="material-symbols-outlined font-bold group-hover:translate-x-2 transition-transform">play_arrow</span>
           </Link>

           <Link 
             href="/split" 
             className="flex-grow md:flex-1 bg-black border-2 border-secondary/30 text-secondary font-headline font-bold py-5 uppercase tracking-[0.3em] hover:border-secondary hover:bg-secondary/5 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all flex justify-center items-center gap-3 group"
           >
              <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">call_split</span>
              Split Expenses
           </Link>
        </div>

        {/* Footer Technical Overlay */}
        <div className="mt-24 w-full flex flex-col md:flex-row justify-between font-mono text-[9px] text-zinc-700 tracking-[0.3em] border-t border-zinc-900 pt-6 gap-4">
           <div className="flex gap-8">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(255,211,0,0.5)]"></span> NETWORK_STABLE</span>
              <span>BANDWIDTH: 1.2 GB/S</span>
           </div>
           <div className="flex gap-8">
              <span>LOCAL_CLOCK: {timeStr || '12:00:00 PM'}</span>
              <span>CORE_REV: 4.2.0_SPLIT</span>
           </div>
        </div>
      </main>

      {firebaseUser && <BottomNav />}

      {/* CRT flicker effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] animate-pulse"></div>
    </div>
  );
}

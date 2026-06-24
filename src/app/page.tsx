'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

export default function LandingPage() {
  const { user } = useUserStore();
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState('INITIALIZING PORT CONSOLE...');

  useEffect(() => {
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
  }, []);

  if (booting) {
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
        <div className="mb-6 font-mono text-primary text-xs uppercase tracking-[0.8em] animate-pulse font-bold">
           Initializing_Neural_Port // 0xSPLIT_ENTRY
        </div>
        
        <div className="relative mb-8 group">
           <h1 className="font-headline text-7xl md:text-9xl font-black text-primary italic tracking-tight drop-shadow-[0_0_30px_rgba(255,211,0,0.4)] transition-all group-hover:drop-shadow-[0_0_50px_rgba(255,211,0,0.7)]">
             SPLIT_SMART
           </h1>
           <div className="absolute -top-4 -right-8 text-secondary font-mono text-sm animate-bounce">NEW!</div>
        </div>
        
        <div className="h-1 w-32 bg-primary mb-10 shadow-[0_0_15px_rgba(255,211,0,0.5)]"></div>
        
        <p className="font-body text-zinc-400 text-lg md:text-xl leading-relaxed mb-16 uppercase tracking-[0.2em] max-w-[600px] border-l-2 border-r-2 border-primary/20 px-8">
           The Retro-Futuristic <span className="text-primary font-bold">Token Exchange</span> Matrix for the Elite Gamer.
        </p>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-lg">
           <Link 
             href="/arena" 
             className="flex-1 bg-primary text-black font-headline font-black py-5 text-lg uppercase tracking-[0.3em] hover:bg-white hover:shadow-[0_0_40px_rgba(255,211,0,0.6)] transition-all flex justify-center items-center gap-3 group relative overflow-hidden"
           >
              {/* Internal glow animation */}
              <div className="absolute top-0 -left-1/2 w-1/4 h-full bg-white/20 skew-x-12 translate-x-[-100%] group-hover:animate-shine transition-all"></div>
              INSERT COIN
              <span className="material-symbols-outlined font-bold group-hover:translate-x-2 transition-transform">play_arrow</span>
           </Link>
           
           <Link 
             href="/agent" 
             className="flex-1 bg-black border-2 border-primary/30 text-primary font-headline font-bold py-5 uppercase tracking-[0.3em] hover:border-primary hover:bg-primary/5 transition-all flex justify-center items-center gap-2"
           >
              AI Agent Manager
           </Link>
        </div>

        <Link 
          href="/split" 
          className="mt-4 w-full max-w-lg bg-black border-2 border-secondary/30 text-secondary font-headline font-bold py-5 uppercase tracking-[0.3em] hover:border-secondary hover:bg-secondary/5 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all flex justify-center items-center gap-3 group"
        >
           <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">call_split</span>
           Split Expenses
        </Link>

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

      {/* Retro HUD edge markers */}
      <div className="fixed left-8 bottom-1/4 hidden lg:flex flex-col gap-12 font-mono text-[9px] text-zinc-800 rotate-180 [writing-mode:vertical-lr] tracking-[0.5em] uppercase">
         <span>Hardware_Acceleration_Stream</span>
         <span className="text-secondary opacity-50">Matrix_Buffer_Synced</span>
      </div>
      <div className="fixed right-8 top-1/4 hidden lg:flex flex-col gap-12 font-mono text-[9px] text-zinc-800 [writing-mode:vertical-lr] tracking-[0.5em] uppercase">
         <span>User_Credential_Validation</span>
         <span className="text-primary opacity-50">Token_Logic_Active</span>
      </div>

      {/* CRT flicker effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] animate-pulse"></div>
    </div>
  );
}

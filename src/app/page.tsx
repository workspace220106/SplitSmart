'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RootPage() {
  const router = useRouter();
  const { firebaseUser, user, isInitialized, isLoading } = useAuthStore();
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
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only redirect when both the boot sequence has finished (progress 100)
    // AND the auth store has finished initializing and loading.
    if (bootProgress === 100 && isInitialized && !isLoading) {
      if (firebaseUser) {
        if (!user) {
          router.push('/setup-profile');
        } else {
          router.push('/arena');
        }
      } else {
        router.push('/welcome');
      }
    }
  }, [bootProgress, isInitialized, isLoading, firebaseUser, user, router]);

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

      {/* CRT flicker effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] animate-pulse"></div>
    </div>
  );
}

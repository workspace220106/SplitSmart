'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useUserStore } from '@/store/userStore';

export default function StorePage() {
  const { user, spendTokens } = useUserStore();

  const powerUps = [
    {
      id: 'agent_boost',
      name: 'Agent Boost',
      description: 'Supercharge the AI Agent Manager to generate immediate high-yield financial insights.',
      price: 250,
      icon: 'bolt',
      type: 'UTILITY'
    },
    {
      id: 'neural_shield',
      name: 'Matrix Shield',
      description: 'Protect your behavior score and rank from decay during high-volatility market events.',
      price: 500,
      icon: 'shield',
      type: 'DEFENSE'
    },
    {
      id: 'data_miner',
      name: 'Vector Miner',
      description: 'Background script that passively increases XP accumulation rate by 20%.',
      price: 1200,
      icon: 'terminal',
      type: 'UPGRADE'
    },
    {
      id: 'premium_access',
      name: 'Elite Clearance',
      description: 'Unlock access to restricted high-volatility stock vectors and dedicated bandwidth.',
      price: 5000,
      icon: 'verified',
      type: 'ACCESS'
    }
  ];

  const handlePurchase = (id: string, price: number) => {
    if (spendTokens(price)) {
       alert(`[SYSTEM] Sync successful. ${id.toUpperCase()} integrated into neural matrix.`);
    } else {
       alert(`[ERROR] TRANSACTION_ABORTED: Insufficient Tokens for authorization.`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body pb-24 md:pb-8 pt-16 relative overflow-hidden">
      <Header />
      
      {/* Background ambient detail */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/20 blur-[150px] rounded-full"></div>
      </div>

      <main className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 max-w-[1200px] mt-4">
        <div className="flex flex-col mb-10 border-l-4 border-secondary pl-6 py-2">
          <h1 className="font-headline text-4xl font-black tracking-tight text-white uppercase italic">
            Neural <span className="text-secondary drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">Market</span>
          </h1>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.5em] mt-2">Black_Market_ID: 0xPAC_STORE // Protocol: ENCRYPTED</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {powerUps.map((item) => {
              const canAfford = user.pacTokens >= item.price;
              
              return (
                <div 
                  key={item.id} 
                  className="bg-zinc-900/10 border-2 border-primary/10 group hover:border-primary/60 hover:shadow-[0_0_30px_rgba(255,211,0,0.1)] transition-all flex flex-col h-full relative"
                >
                   {/* Item type badge */}
                   <div className="absolute top-0 right-0 px-3 py-1 bg-zinc-900 font-mono text-[8px] text-zinc-500 border-l border-b border-primary/20 uppercase tracking-widest font-bold">
                      {item.type}
                   </div>

                   <div className="p-8 flex-grow flex flex-col items-center text-center">
                      <div className="w-20 h-20 mb-6 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(255,211,0,0.4)] transition-all transform group-hover:scale-110">
                         <span className="material-symbols-outlined text-4xl text-primary">{item.icon}</span>
                      </div>
                      
                      <h3 className="font-headline text-xl font-black text-white uppercase mb-4 tracking-widest group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="font-body text-xs text-zinc-400 leading-relaxed mb-8 px-2 uppercase tracking-wide opacity-80">
                         {item.description}
                      </p>
                   </div>

                   <div className="p-6 bg-zinc-900/40 border-t-2 border-primary/10">
                      <div className="flex justify-between items-center mb-6 font-mono">
                         <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Vector_Cost</span>
                         <span className="text-primary text-base font-black shadow-[0_0_10px_rgba(255,211,0,0.2)]">
                            {item.price.toLocaleString()} <span className="text-[10px] opacity-60">TK</span>
                         </span>
                      </div>
                      <button 
                         onClick={() => handlePurchase(item.id, item.price)}
                         disabled={!canAfford}
                         className={`w-full font-headline font-black text-xs py-4 uppercase tracking-[0.3em] border-2 transition-all flex items-center justify-center gap-2 ${
                            canAfford 
                            ? 'bg-primary/5 border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_25px_rgba(255,211,0,0.5)]' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-700 cursor-not-allowed opacity-40'
                         }`}
                      >
                         <span className="material-symbols-outlined text-sm">{canAfford ? 'shopping_cart' : 'lock'}</span>
                         {canAfford ? 'INITIALIZE' : 'LOCKED'}
                      </button>
                   </div>
                </div>
              );
           })}
        </div>

        {/* Neural Market HUD */}
        <div className="mt-16 p-8 bg-black border-2 border-primary/20 relative overflow-hidden group">
           {/* Animated background bar */}
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl -rotate-12">videogame_asset</span>
           </div>
           <div className="flex flex-col md:flex-row gap-10 items-center justify-between relative z-10">
              <div className="flex flex-col">
                 <h2 className="font-headline text-2xl text-primary uppercase mb-3 font-black tracking-widest drop-shadow-[0_0_10px_rgba(255,211,0,0.3)]">Black Market Uplink</h2>
                 <p className="font-body text-sm text-zinc-400 max-w-2xl leading-relaxed uppercase tracking-tight">
                    The neural market refreshes every 24 clock cycles. High-tier power-ups require specific Rank Clearance levels to authorize.
                 </p>
              </div>
              <div className="flex flex-col items-end min-w-[200px] border-l-2 border-primary/20 pl-8">
                 <span className="font-mono text-[9px] text-zinc-600 uppercase mb-2 tracking-[0.2em] font-bold">Active Wallet</span>
                 <span className="font-mono text-3xl text-white font-black">{user.pacTokens.toLocaleString()} <span className="text-sm text-primary">TK</span></span>
              </div>
           </div>
        </div>
      </main>

      <BottomNav />
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] z-[100]"></div>
    </div>
  );
}

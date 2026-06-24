'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useUserStore } from '@/store/userStore';

export default function MissionsPage() {
  const { missions, completeMission } = useUserStore();

  const categories = [
    { label: 'ALL_UPGRADES', count: missions.length },
    { label: 'ACTIVE_SEQUENCES', count: missions.filter(m => !m.completed).length },
    { label: 'CLEARED_STAGES', count: missions.filter(m => m.completed).length },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-body pb-24 md:pb-8 pt-16 relative overflow-hidden">
      <Header />
      
      {/* Arcade decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full opacity-60"></div>
      </div>

      <main className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 max-w-[1000px] mt-4">
        <div className="flex flex-col mb-10 border-b border-primary/20 pb-8">
          <h1 className="font-headline text-4xl font-black tracking-tight text-white uppercase italic">
            Quest <span className="text-primary drop-shadow-[0_0_10px_rgba(255,211,0,0.5)]">Log</span>
          </h1>
          <div className="flex gap-8 mt-6 overflow-x-auto pb-2 scrollbar-hide">
             {categories.map(cat => (
                <button key={cat.label} className="flex items-center gap-3 group whitespace-nowrap">
                   <span className="font-headline text-[10px] text-zinc-500 group-hover:text-primary transition-colors tracking-[0.2em] uppercase font-bold">{cat.label}</span>
                   <span className="font-mono text-xs bg-zinc-900 px-3 py-0.5 border border-primary/30 text-primary font-bold">{cat.count}</span>
                </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {missions.length === 0 ? (
              <div className="bg-zinc-900/20 border-2 border-dashed border-primary/10 p-20 flex flex-col items-center text-center">
                 <span className="material-symbols-outlined text-5xl text-zinc-800 mb-6 scale-150">joystick</span>
                 <p className="font-headline text-sm text-zinc-600 uppercase tracking-[0.5em] font-bold">Waiting for Neural Assignments...</p>
                 <button className="mt-8 bg-zinc-900 text-primary border border-primary/50 px-8 py-3 font-headline font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-all">
                    Sync Database
                 </button>
              </div>
           ) : (
              missions.map((mission) => (
                <div 
                  key={mission.id} 
                  className={`bg-black border-2 relative group transition-all overflow-hidden ${
                    mission.completed 
                    ? 'border-zinc-800/50 opacity-50' 
                    : 'border-primary/20 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(255,211,0,0.1)]'
                  }`}
                >
                   {/* Top Accent Strip */}
                   {!mission.completed && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white/50 to-primary shadow-[0_0_15px_rgba(255,211,0,0.5)]"></div>
                   )}

                   <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex-grow">
                         <div className="flex items-center gap-4 mb-3">
                            <div className={`w-3 h-3 border border-primary ${mission.completed ? 'bg-zinc-700' : 'bg-primary animate-pulse'}`}></div>
                            <h3 className="font-headline text-xl font-black tracking-widest uppercase text-white group-hover:text-primary transition-colors">
                               {mission.title}
                            </h3>
                         </div>
                         <p className="font-body text-sm text-zinc-400 max-w-xl leading-relaxed">
                            {mission.description}
                         </p>
                      </div>

                      <div className="flex flex-col md:items-end gap-4 min-w-[220px]">
                         <div className="flex gap-6">
                            <div className="flex flex-col items-center">
                               <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-tighter">Bonus XP</span>
                               <span className="font-mono text-base text-secondary font-black">+{mission.reward.xp}</span>
                            </div>
                            <div className="flex flex-col items-center">
                               <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-tighter">Credits</span>
                               <span className="font-mono text-base text-primary font-black">+{mission.reward.tokens} <span className="text-[10px] opacity-70">TK</span></span>
                            </div>
                         </div>

                         {!mission.completed && (
                            <div className="w-full">
                               <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-2 uppercase tracking-widest font-bold">
                                  <span>Neural Link</span>
                                  <span className="text-white">{Math.round((mission.progress / mission.target) * 100)}%</span>
                               </div>
                               <div className="w-full h-2 bg-zinc-900 relative">
                                  <div 
                                    className="h-full bg-primary transition-all duration-700 shadow-[0_0_15px_rgba(255,211,0,0.4)]"
                                    style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                                  ></div>
                               </div>
                            </div>
                         )}

                         {mission.progress >= mission.target && !mission.completed && (
                            <button 
                               onClick={() => completeMission(mission.id)}
                               className="w-full bg-primary text-black font-headline font-black text-xs py-3 uppercase tracking-[0.3em] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-2"
                            >
                               <span className="material-symbols-outlined text-sm">stars</span>
                               Claim Rewards
                            </button>
                         )}
                      </div>
                   </div>
                </div>
              ))
           )}
        </div>
      </main>

      <BottomNav />
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] z-[100]"></div>
    </div>
  );
}

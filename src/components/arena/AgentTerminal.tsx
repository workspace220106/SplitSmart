'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { generateInsights } from '@/services/aiService';
import { AIAdvice } from '@/types';

export default function AgentTerminal() {
  const { user, missions } = useUserStore();
  const [insights, setInsights] = useState<AIAdvice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await generateInsights({
          level: user.level,
          xp: user.xp,
          behaviorScore: user.behaviorScore,
          pacTokens: user.pacTokens,
          monthlyBudget: 2000,
          currentSpending: 850,
          savingsRate: 0.15,
          activeMissions: missions,
          recentTransactions: [],
          streakDays: user.streakDays
        });
        setInsights(res);
      } catch (error) {
        console.error("Agent analytics drift:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    const interval = setInterval(fetchInsights, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, [user.level, user.xp, user.behaviorScore, user.pacTokens, missions]);

  return (
    <div className="agent-theme bg-surface/40 border border-outline/30 p-5 flex flex-col gap-4 relative overflow-hidden rounded-xl backdrop-blur-xl transition-all hover:border-primary/40 group shadow-xl">
      {/* HUD Accent */}
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
         <span className="material-symbols-outlined text-4xl text-primary">analytics</span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-headline text-[10px] uppercase tracking-[0.3em] text-primary flex items-center gap-2 font-bold">
          <span className="material-symbols-outlined text-sm">smart_toy</span>
          Agent_Insights
        </h3>
        <div className="flex gap-1.5 items-center">
           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
           <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Live_Feed</span>
        </div>
      </div>

      <div className="h-[200px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="space-y-4 pt-4 px-2">
             <div className="h-4 bg-primary/5 border border-primary/10 animate-pulse w-full rounded"></div>
             <div className="h-4 bg-primary/5 border border-primary/10 animate-pulse w-4/5 rounded"></div>
             <div className="h-2 bg-primary/5 border border-primary/10 animate-pulse w-1/2 mt-4 rounded"></div>
             <span className="text-[10px] text-primary/40 animate-pulse uppercase mt-2 tracking-widest block font-mono">Aggregating Analytics...</span>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-background/40 border border-outline/20 p-4 rounded-lg hover:border-primary/20 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${
                     insight.priority === 'high' ? 'text-primary' : 'text-secondary'
                   }`}>
                      {insight.type}
                   </span>
                   {insight.priority === 'high' && (
                      <span className="material-symbols-outlined text-[10px] text-primary animate-bounce">warning</span>
                   )}
                </div>
                <h4 className="font-headline text-xs font-bold text-on-surface mb-2 uppercase tracking-widest">{insight.title}</h4>
                <p className="font-body text-[11px] text-on-surface-variant leading-relaxed">
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="w-full mt-2 font-headline text-[9px] font-black py-4 border border-primary/30 text-primary uppercase tracking-[0.3em] hover:bg-primary/10 hover:border-primary transition-all flex items-center justify-center gap-2 rounded-lg">
         <span className="material-symbols-outlined text-sm">open_in_new</span>
         Expanded Portfolio Analysis
      </button>
    </div>
  );
}

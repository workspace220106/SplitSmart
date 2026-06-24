'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useUserStore, LEVEL_NAMES, LEVEL_THRESHOLDS } from '@/store/userStore';
import { useStockStore } from '@/store/stockStore';
import { useSplitStore } from '@/store/splitStore';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user, missions, badges, earnBadge, setPremium } = useUserStore();
  const { getPortfolio } = useStockStore();
  const { groups, expenses, settlements, currentUser } = useSplitStore();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'split' | 'portfolio' | 'achievements' | 'preferences'>('overview');

  // Derived stock details
  const portfolio = getPortfolio();
  const stockHoldings = portfolio.holdings || [];
  const stockBalance = portfolio.balance || 0;
  const portfolioTotalValue = portfolio.totalValue || 0;
  const stockProfitLoss = portfolio.totalProfitLoss || 0;
  const stockProfitLossPercent = portfolio.totalProfitLossPercent || 0;

  // Derived split details
  let totalOwedToMe = 0;
  let totalIOwe = 0;
  const userGroups = groups.filter(g => g.members.some(m => m.id === currentUser.id));

  // Compute net balance in each group
  userGroups.forEach(group => {
    const groupExpenses = expenses.filter(e => e.groupId === group.id);
    const groupSettlements = settlements.filter(s => s.groupId === group.id);
    
    // Simple net calculation for user
    let paidSum = groupExpenses.filter(e => e.payerId === currentUser.id).reduce((sum, e) => sum + e.amount, 0);
    
    // Deduct settlements user paid to others or add settlements user received from others
    let settlementsPaid = groupSettlements.filter(s => s.fromUserId === currentUser.id && s.status === 'completed').reduce((sum, s) => sum + s.amount, 0);
    let settlementsReceived = groupSettlements.filter(s => s.toUserId === currentUser.id && s.status === 'completed').reduce((sum, s) => sum + s.amount, 0);

    // Calculate share: equal share for simplicity in calculating overall summary in profile
    let totalGroupExpenses = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
    let userShare = totalGroupExpenses / (group.members.length || 1);
    
    let net = (paidSum + settlementsPaid) - (userShare + settlementsReceived);
    if (net > 0) {
      totalOwedToMe += net;
    } else if (net < 0) {
      totalIOwe += Math.abs(net);
    }
  });

  const levelName = LEVEL_NAMES[user.level - 1] || 'Finance Master';
  const xpForCurrentLevel = LEVEL_THRESHOLDS[user.level - 1] || 0;
  const xpForNextLevel = LEVEL_THRESHOLDS[user.level] || 1000;
  const levelProgressPercent = Math.min(
    100,
    Math.max(0, ((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#070707] text-white font-body pb-24 md:pb-8 pt-16 relative">
      {/* Background glow matrix */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      
      <Header />
      
      <main className="container mx-auto p-4 md:p-6 max-w-5xl mt-6 relative z-10 space-y-6">
        
        {/* Profile Identity Card */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-secondary/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Avatar Ring */}
          <div className="relative shrink-0 select-none group">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-primary via-secondary to-tertiary animate-[spin_8s_linear_infinite] group-hover:animate-[spin_4s_linear_infinite] transition-all">
              <div className="w-full h-full rounded-full border-4 border-black bg-zinc-900 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-zinc-800/80 transition-colors">
                <span className="material-symbols-outlined text-zinc-500 text-[28px] group-hover:text-primary group-hover:scale-110 transition-all duration-300 select-none">add_a_photo</span>
              </div>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-primary text-black font-headline font-black text-[9px] px-3.5 py-1 rounded-full shadow-[0_5px_15px_rgba(255,211,0,0.3)] border-2 border-zinc-950 whitespace-nowrap">
              LVL {user.level}
            </div>
          </div>

          {/* Details */}
          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <h2 className="text-2xl font-black font-headline tracking-wide">{user.name}</h2>
              <span className="text-[10px] font-mono font-bold bg-[#142c38] text-secondary border border-secondary/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {levelName}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mt-1">{user.email || 'player@splitsmart.app'}</p>
            
            {/* Status indicators */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
              <div className="flex items-center gap-1.5 border border-green-500/25 bg-green-500/5 text-green-400 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                KYC VERIFIED
              </div>
              <div className="flex items-center gap-1.5 border border-secondary/25 bg-secondary/5 text-secondary px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">military_tech</span>
                {user.isPremium ? 'PRO MEMBER' : 'STANDARD'}
              </div>
              <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/60 text-zinc-400 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                STREAK: {user.streakDays} DAYS
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-850 overflow-x-auto scrollbar-hide gap-1 text-[13px] font-body select-none">
          {(['overview', 'split', 'portfolio', 'achievements', 'preferences'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 px-6 border-b-2 font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-secondary text-secondary shadow-[inset_0_-8px_8px_-6px_rgba(0,240,255,0.08)] font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'split' ? 'SplitSmart' : tab === 'achievements' ? 'XP & Achievements' : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* credit card column */}
              <div className="md:col-span-7 space-y-6">
                
                {/* PacPay Titanium Card Card */}
                <div className="relative h-56 w-full rounded-2xl bg-gradient-to-br from-[#151515] to-[#080808] border border-zinc-800 p-6 flex flex-col justify-between overflow-hidden group shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:border-secondary/35 transition-all duration-500">
                  {/* Glowing micro-elements */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary/15 to-transparent rounded-full blur-2xl opacity-60"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PACPay Infinite</div>
                      <div className="text-[15px] font-headline font-black text-white mt-1 italic tracking-tight">SPLIT SMART</div>
                    </div>
                    {/* Metal chip */}
                    <div className="w-10 h-8 rounded-md bg-gradient-to-r from-zinc-700 via-zinc-650 to-zinc-700 border border-zinc-800 relative overflow-hidden shadow-inner flex items-center justify-center">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_100%)]"></div>
                      <div className="w-6 h-4 border border-zinc-800/40 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Card Number & Balance */}
                  <div className="z-10 mt-4">
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Vault Balance</div>
                    <div className="text-4xl font-headline font-black tracking-tight text-primary">₹{user.pacTokens}</div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-end z-10">
                    <div>
                      <div className="text-[8px] font-mono text-zinc-600 uppercase">Card Holder</div>
                      <div className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">{user.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-mono text-zinc-600 uppercase">Level Multiplier</div>
                      <div className="text-xs font-mono font-bold text-secondary">x{(1 + user.level * 0.1).toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                {/* Quick actions bar */}
                <div className="grid grid-cols-3 gap-4">
                  <button className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 flex flex-col items-center gap-1.5 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-secondary text-[22px]">add_circle</span>
                    <span className="text-[11px] font-mono font-bold tracking-wide uppercase text-zinc-400">Load</span>
                  </button>
                  <button className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 flex flex-col items-center gap-1.5 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-primary text-[22px]">send</span>
                    <span className="text-[11px] font-mono font-bold tracking-wide uppercase text-zinc-400">Send</span>
                  </button>
                  <button className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 flex flex-col items-center gap-1.5 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-tertiary text-[22px]">history</span>
                    <span className="text-[11px] font-mono font-bold tracking-wide uppercase text-zinc-400">History</span>
                  </button>
                </div>

              </div>

              {/* Behavior Score Meter Column */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Financial Integrity Card */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between h-full shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">Integrity Score</div>
                    <span className="material-symbols-outlined text-green-400">gavel</span>
                  </div>

                  {/* Circular Arc Design */}
                  <div className="relative flex flex-col items-center justify-center my-4">
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      {/* background track */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1c1c1c" strokeWidth="8" />
                      {/* fill arc */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="url(#integrityGrad)" 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - user.behaviorScore / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient id="integrityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00F0FF" />
                          <stop offset="100%" stopColor="#FFD300" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Score value */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-headline font-black tracking-tight">{user.behaviorScore}</div>
                      <div className="text-[9px] font-mono uppercase text-zinc-500">Tier A+</div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-zinc-400 mt-2 font-body leading-relaxed">
                    You have high financial integrity! Good bill repayment behavior qualifies you for elite investment rewards.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SPLITSMART TAB */}
          {activeTab === 'split' && (
            <div className="space-y-6">
              
              {/* Financial Balance Summary Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-green-500/35 transition-colors">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Owed to Me</div>
                    <div className="text-3xl font-headline font-black text-green-400 mt-2">₹{totalOwedToMe.toFixed(2)}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <span className="material-symbols-outlined">call_made</span>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-error/35 transition-colors">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">You Owe</div>
                    <div className="text-3xl font-headline font-black text-red-500 mt-2">₹{totalIOwe.toFixed(2)}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <span className="material-symbols-outlined">call_received</span>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-secondary/35 transition-colors">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Active Split Groups</div>
                    <div className="text-3xl font-headline font-black text-secondary mt-2">{userGroups.length}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                </div>
              </div>

              {/* Group summaries */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">folder_shared</span>
                  Group Bill Split Ledger
                </div>

                {userGroups.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    No active bill splitting groups joined.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900">
                    {userGroups.map(group => {
                      const groupExpenses = expenses.filter(e => e.groupId === group.id);
                      const totalExp = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

                      return (
                        <div key={group.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                          <div>
                            <div className="text-sm font-semibold text-white">{group.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">Total spent: ₹{totalExp} • {group.members.length} members</div>
                          </div>
                          <span className="material-symbols-outlined text-zinc-600">chevron_right</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              
              {/* Portfolio Performance stats */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Total Value */}
                <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Trading Portfolio Net Value</div>
                    <span className="material-symbols-outlined text-secondary">show_chart</span>
                  </div>
                  <div>
                    <div className="text-4xl font-headline font-black text-white">₹{portfolioTotalValue.toFixed(2)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        stockProfitLoss >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {stockProfitLoss >= 0 ? '▲' : '▼'} ₹{Math.abs(stockProfitLoss).toFixed(2)} ({stockProfitLossPercent.toFixed(2)}%)
                      </span>
                      <span className="text-[10px] text-zinc-500">ALL TIME RETURN</span>
                    </div>
                  </div>
                </div>

                {/* Assets split mini-chart */}
                <div className="md:col-span-4 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-4">Asset Split</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Cash (Pac-Tokens)</span>
                      <span className="font-mono font-bold text-white">
                        {portfolioTotalValue > 0 ? ((stockBalance / portfolioTotalValue) * 100).toFixed(0) : 100}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${portfolioTotalValue > 0 ? (stockBalance / portfolioTotalValue) * 100 : 100}%` }}></div>
                      <div className="h-full bg-secondary" style={{ width: `${portfolioTotalValue > 0 ? ((portfolioTotalValue - stockBalance) / portfolioTotalValue) * 100 : 0}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Stock Assets</span>
                      <span className="font-mono font-bold text-white">
                        {portfolioTotalValue > 0 ? (((portfolioTotalValue - stockBalance) / portfolioTotalValue) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Holdings list */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-900 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">inventory_2</span>
                  Active Stock Holdings
                </div>
                
                {stockHoldings.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    No active stock assets purchased in the Arena.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 font-mono">
                          <th className="py-4 px-6">Asset</th>
                          <th className="py-4 px-6 text-right">Shares</th>
                          <th className="py-4 px-6 text-right">Avg Buy Price</th>
                          <th className="py-4 px-6 text-right">Current Price</th>
                          <th className="py-4 px-6 text-right">Returns</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 font-mono">
                        {stockHoldings.map(h => {
                          const returns = h.profitLoss || 0;
                          return (
                            <tr key={h.symbol} className="hover:bg-zinc-900/40 transition-colors">
                              <td className="py-4 px-6 font-headline font-black text-sm text-white tracking-wider">{h.symbol}</td>
                              <td className="py-4 px-6 text-right font-medium">{h.shares}</td>
                              <td className="py-4 px-6 text-right text-zinc-400">₹{h.avgBuyPrice.toFixed(2)}</td>
                              <td className="py-4 px-6 text-right text-zinc-300">₹{(h.currentPrice || h.avgBuyPrice).toFixed(2)}</td>
                              <td className={`py-4 px-6 text-right font-bold ${returns >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                {returns >= 0 ? '+' : ''}₹{returns.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              
              {/* Level XP Progress card */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00abec]/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Milestone Progress</div>
                    <div className="text-xl font-headline font-black text-white mt-1">Level {user.level} XP Matrix</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-400">{user.xp} / {xpForNextLevel} XP</div>
                    <div className="text-[9px] font-mono text-zinc-600 mt-0.5">({(xpForNextLevel - user.xp)} XP TO LEVEL {user.level + 1})</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden mt-4 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary via-tertiary to-primary transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    style={{ width: `${levelProgressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Achievements list */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-tertiary">emoji_events</span>
                  Earned Achievements Badges
                </div>

                {badges.length === 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Mock Locked Badges */}
                    <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl flex flex-col items-center text-center opacity-40 hover:opacity-75 transition-opacity select-none">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                        <span className="material-symbols-outlined text-2xl">egg</span>
                      </div>
                      <div className="text-xs font-semibold text-white">First Split</div>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono">Settle your first shared expense group bill.</div>
                    </div>

                    <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl flex flex-col items-center text-center opacity-40 hover:opacity-75 transition-opacity select-none">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                        <span className="material-symbols-outlined text-2xl">shield</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Integrity Guard</div>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono">Maintain a behavior score above 85 for 7 days.</div>
                    </div>

                    <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl flex flex-col items-center text-center opacity-40 hover:opacity-75 transition-opacity select-none">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                        <span className="material-symbols-outlined text-2xl">diamond</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Asset Titan</div>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono">Reach a stock portfolio valuation of ₹20,000.</div>
                    </div>

                    <div className="border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl flex flex-col items-center text-center opacity-40 hover:opacity-75 transition-opacity select-none">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                        <span className="material-symbols-outlined text-2xl">flash_on</span>
                      </div>
                      <div className="text-xs font-semibold text-white">Pac Streak</div>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono">Log into SplitSmart for 5 consecutive days.</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map(badge => (
                      <div key={badge.id} className="border border-zinc-800 bg-zinc-900/20 p-4 rounded-xl flex flex-col items-center text-center shadow-md">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-3">
                          <span className="material-symbols-outlined text-2xl">{badge.icon}</span>
                        </div>
                        <div className="text-xs font-semibold text-white">{badge.name}</div>
                        <div className="text-[9px] text-zinc-500 mt-1 font-mono">{badge.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
              
              {/* Account Setting Fields */}
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-zinc-400">person_settings</span>
                  General Preferences
                </div>
                
                <div className="space-y-4 font-body">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <div className="text-sm font-semibold text-white">System notifications</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">Receive email alerts on bill splits and settlements</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <div className="text-sm font-semibold text-white">AI Financial Coaching</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">Allow AI agent to review monthly budgeting habits</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <div className="text-sm font-semibold text-white">Elite Pro Tier</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">Unlocks premium stock volatility indicators</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={user.isPremium} 
                        onChange={(e) => setPremium(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-zinc-900">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-red-500 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-red-500">warning</span>
                  Danger Zone
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                  <div>
                    <div className="text-sm font-semibold text-white">Reset Account History</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Clears all XP levels, stock transaction matrices, and split expenses</div>
                  </div>
                  <button className="bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-black font-semibold text-red-500 text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                    RESET DATA
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      <BottomNav />
    </div>
  );
}

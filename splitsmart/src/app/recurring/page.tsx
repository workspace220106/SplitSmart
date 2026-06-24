'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import { useSplitStore } from '../../store/splitStore';
import { 
  Calendar, 
  ArrowLeft, 
  Trash2, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function RecurringPage() {
  const { expenses, deleteExpense, groups, usersList } = useSplitStore();

  const recurringExpenses = expenses.filter(e => e.isRecurring);

  const getGroupName = (gId: string) => {
    return groups.find(g => g.id === gId)?.name || 'Private Split';
  };

  const getPayerName = (pId: string) => {
    return usersList.find(u => u.id === pId)?.name || 'Unknown Payer';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono relative overflow-hidden">
      
      {/* CRT scanline simulation */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
      
      <Navbar />

      {/* Floating arcade graphics background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(255,184,255,0.02)_0%,transparent_70%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-6 space-y-6 relative z-10">
        
        {/* Back link */}
        <Link href="/" className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline mb-2 uppercase tracking-wider">
          <ArrowLeft className="h-3.5 w-3.5" /> [RETURN_TO_DASHBOARD]
        </Link>

        <div className="flex items-center justify-between border-b border-primary/20 pb-4">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">RECURRING_BILLING_REGISTRY</h1>
            <p className="text-gray-500 text-xs mt-1 uppercase">Automated split bills logged on active node schedule triggers.</p>
          </div>
          <span className="text-[10px] text-secondary font-bold bg-secondary/10 border border-secondary/30 px-2.5 py-1 rounded-none flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recurringExpenses.length} DAEMON_CRONS
          </span>
        </div>

        {recurringExpenses.length === 0 ? (
          <div className="hud-card rounded-none p-12 text-center border-dashed border-primary/20 space-y-4">
            <Calendar className="mx-auto h-10 w-10 text-primary/40 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">No active schedule crons</h3>
            <p className="text-[10px] text-gray-500 max-w-sm mx-auto uppercase">
              Toggle the "Enable Cron Scheduler" parameter inside the expense logging interface to schedule automatic billing.
            </p>
            <Link href="/" className="inline-block border border-primary bg-primary/5 hover:bg-primary text-primary hover:text-black px-5 py-2 text-xs font-bold transition-all uppercase">
              Configure Splits
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recurringExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className="hud-card rounded-none p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-4 font-mono">
                  <div>
                    <span className="inline-block rounded-none bg-secondary/10 border border-secondary/20 px-2 py-0.5 text-[8px] font-bold tracking-widest text-secondary uppercase mb-2">
                      {expense.recurringInterval} TRIGGER
                    </span>
                    <h3 className="font-bold text-white text-sm uppercase tracking-tight">{expense.description}</h3>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase">
                      Channel: <span className="text-gray-300 font-semibold">{getGroupName(expense.groupId)}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 uppercase">
                      Origin Node: <span className="text-gray-300 font-semibold">{getPayerName(expense.payerId)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-white">₹{expense.amount.toFixed(2)}</p>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">{expense.category}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-primary/10 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1 text-[8px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold uppercase tracking-widest">
                    <CheckCircle className="h-3 w-3" />
                    <span>Cron Active</span>
                  </div>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-error transition-colors font-bold px-2 py-1 rounded hover:bg-error/5 cursor-pointer uppercase"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Stop daemon
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-[10px] text-gray-400 space-y-1.5 uppercase font-mono tracking-wide leading-relaxed">
            <h4 className="font-bold text-primary">// AUTOMATED_DAEMON_CRON_LOGIC</h4>
            <p>
              On system initialization, SplitSmart compares localized time counters. If the interval duration threshold has been breached (e.g. daily/weekly/monthly rollover), the engine commits a fresh transaction entry to the ledger node and updates group balances.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

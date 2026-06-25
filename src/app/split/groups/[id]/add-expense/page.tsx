'use client';

import React, { useState, use } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useSplitStore } from '@/store/splitStore';
import { SplitCategory, SplitType } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  const router = useRouter();
  
  const { currentUser, groups, addExpense } = useSplitStore();
  const group = groups.find(g => g.id === groupId);

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SplitCategory>('food');
  const [payerId, setPayerId] = useState(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  
  // Custom split mapping
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});
  const [participants, setParticipants] = useState<Record<string, boolean>>({});
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  React.useEffect(() => {
    if (group) {
      const initialParts: Record<string, boolean> = {};
      const initialDetails: Record<string, number> = {};
      group.members.forEach(member => {
        initialParts[member.id] = true;
        initialDetails[member.id] = 0;
      });
      setParticipants(initialParts);
      setSplitDetails(initialDetails);
    }
  }, [group]);

  if (!group) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-mono">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-widest">GROUP_NODE_NOT_SYNCED</p>
          <Link href="/split" className="mt-4 border border-primary bg-primary/5 hover:bg-primary text-primary hover:text-black px-5 py-2 text-xs font-bold transition-all uppercase">
            Return to Dashboard
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const numAmount = parseFloat(amount) || 0;

  // Validation checks
  let isValid = true;
  let validationMessage = '';

  if (numAmount <= 0) {
    isValid = false;
    validationMessage = 'INPUT VALUE GREATER THAN ZERO.';
  } else if (!description.trim()) {
    isValid = false;
    validationMessage = 'DESCRIPTION STRING REQUIRED.';
  } else if (splitType === 'equal') {
    const activeCount = Object.values(participants).filter(Boolean).length;
    if (activeCount === 0) {
      isValid = false;
      validationMessage = 'SELECT AT LEAST ONE ACTIVE SPLIT NODE.';
    }
  } else if (splitType === 'percentage') {
    const sum = Object.entries(splitDetails).reduce((acc, [userId, val]) => acc + (val || 0), 0);
    if (Math.abs(sum - 100) > 0.01) {
      isValid = false;
      validationMessage = `SUM PERCENTAGE MUST EQUAL 100%. CURRENT: ${sum}% (REMAINING: ${100 - sum}%)`;
    }
  } else if (splitType === 'exact') {
    const sum = Object.entries(splitDetails).reduce((acc, [userId, val]) => acc + (val || 0), 0);
    if (Math.abs(sum - numAmount) > 0.01) {
      isValid = false;
      validationMessage = `SUM MANIFEST MUST EQUAL TOTAL VALUE (₹${numAmount.toFixed(2)}). CURRENT: ₹${sum.toFixed(2)} (REMAINING: ₹${(numAmount - sum).toFixed(2)})`;
    }
  } else if (splitType === 'shares') {
    const sumShares = Object.values(splitDetails).reduce((acc, val) => acc + (val || 0), 0);
    if (sumShares <= 0) {
      isValid = false;
      validationMessage = 'ASSIGN AT LEAST ONE SHARE COEFFICIENT.';
    }
  }

  const handleDetailChange = (userId: string, val: string) => {
    const numeric = parseFloat(val) || 0;
    setSplitDetails(prev => ({
      ...prev,
      [userId]: numeric
    }));
  };

  const handleParticipantToggle = (userId: string) => {
    setParticipants(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    let finalSplitDetails: Record<string, number> = {};
    
    if (splitType === 'equal') {
      Object.entries(participants).forEach(([userId, isActive]) => {
        if (isActive) finalSplitDetails[userId] = 1;
      });
    } else {
      Object.entries(splitDetails).forEach(([userId, val]) => {
        if (val > 0) finalSplitDetails[userId] = val;
      });
    }

    addExpense({
      groupId: group.id,
      amount: numAmount,
      description,
      category,
      payerId,
      splitType,
      splitDetails: finalSplitDetails,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined
    });

    router.push(`/split/groups/${group.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono relative overflow-hidden pb-24 md:pb-8 pt-16">
      <Header />

      {/* CRT scanline simulation */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6 space-y-6 relative z-10">
        
        {/* Back Link */}
        <Link href={`/split/groups/${group.id}`} className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline mb-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-xs">arrow_back</span> [ABORT_TO_CHANNEL]
        </Link>

        <div className="hud-card rounded-none p-6 md:p-8 space-y-6">
          <div className="border-b border-primary/20 pb-4">
            <h1 className="text-xl font-bold uppercase tracking-widest text-primary font-headline">LOG_TRANSACTION_SPLIT</h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono">Define expense weights, payer metrics, and split parameters.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Amount & Description Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Transaction Label</label>
                <input
                  type="text"
                  placeholder="e.g. ROOM_RENT"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Transaction Value (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-bold font-mono"
                  required
                />
              </div>
            </div>

            {/* Category & Payer Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sector Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SplitCategory)}
                  className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                >
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sourcing Node (Payer)</label>
                <select
                  value={payerId}
                  onChange={e => setPayerId(e.target.value)}
                  className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                >
                  {group.members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.id === currentUser.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Type Selector */}
            <div className="space-y-2 border-t border-primary/10 pt-4">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Allocation Logic</label>
              <div className="grid grid-cols-4 gap-2">
                {(['equal', 'percentage', 'exact', 'shares'] as SplitType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`rounded-none py-2 text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      splitType === type
                        ? 'bg-primary text-black font-black'
                        : 'border border-primary/30 hover:border-primary bg-black text-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Split Details Allocator */}
            <div className="space-y-3 bg-black border border-primary/20 p-4 rounded-none">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                {splitType === 'equal' && 'EQUAL SPLIT MATRIX'}
                {splitType === 'percentage' && 'PERCENTAGE INDEX ALLOCATION'}
                {splitType === 'exact' && 'EXACT NOMINAL VALUE DEPOSIT'}
                {splitType === 'shares' && 'WEIGHTED SHARE DISTRIBUTION'}
              </p>

              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4 font-mono">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {splitType === 'equal' && (
                        <input
                          type="checkbox"
                          checked={participants[member.id] !== false}
                          onChange={() => handleParticipantToggle(member.id)}
                          className="accent-primary h-4 w-4 rounded-none border-primary"
                        />
                      )}
                      <span className="text-xs font-bold text-white uppercase truncate">{member.name}</span>
                    </div>

                    {splitType !== 'equal' && (
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={splitDetails[member.id] === 0 ? '' : splitDetails[member.id]}
                          placeholder="0"
                          onChange={e => handleDetailChange(member.id, e.target.value)}
                          className="bg-black border border-primary/30 rounded-none px-3 py-1.5 text-xs text-right w-24 text-white focus:outline-none focus:border-primary font-mono"
                        />
                        <span className="absolute right-2 top-2 text-[9px] text-gray-500 font-bold pointer-events-none">
                          {splitType === 'percentage' && '%'}
                          {splitType === 'exact' && '₹'}
                          {splitType === 'shares' && 'sh'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring Expense Check */}
            <div className="border-t border-primary/10 pt-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="recurring-toggle"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="accent-primary h-4 w-4 rounded-none border-primary"
                />
                <label htmlFor="recurring-toggle" className="text-[10px] font-bold text-gray-300 uppercase cursor-pointer select-none tracking-wider">
                  Enable Cron Scheduler (Auto-Recurring)
                </label>
              </div>

              {isRecurring && (
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((interval) => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setRecurringInterval(interval)}
                      className={`flex-1 rounded-none py-1.5 text-[9px] font-bold capitalize transition-all cursor-pointer ${
                        recurringInterval === interval
                          ? 'bg-secondary text-black font-bold'
                          : 'border border-primary/30 hover:border-primary text-gray-400 bg-black'
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Validation alerts */}
            {!isValid && validationMessage && (
              <div className="border border-error/20 bg-error/5 p-3 text-[10px] text-error flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-error shrink-0">warning</span>
                <span className="uppercase">{validationMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full flex items-center justify-center gap-2 rounded-none py-2.5 text-xs font-black transition-all ${
                isValid
                  ? 'bg-primary text-black hover:bg-white shadow-[0_0_15px_rgba(255,211,0,0.3)] cursor-pointer'
                  : 'border border-primary/30 text-gray-600 bg-black cursor-not-allowed'
              } uppercase tracking-wider font-headline`}
            >
              <span className="material-symbols-outlined text-sm font-bold">monetization_on</span> Commit Ledger Entry
            </button>

          </form>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}

'use client';

import React, { useState, use } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useSplitStore } from '@/store/splitStore';
import { simplifyDebts, calculateNetBalances } from '@/lib/debtSimplifier';
import { exportExpensesToCSV } from '@/lib/export';
import { generateUPILink, generateUPIQRCodeUrl } from '@/lib/upi';
import Link from 'next/link';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  
  const { 
    currentUser, 
    groups, 
    expenses, 
    settlements, 
    deleteExpense, 
    addSettlement,
    usersList
  } = useSplitStore();

  const group = groups.find(g => g.id === groupId);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Settlement QR Modal State
  const [activePaySettlement, setActivePaySettlement] = useState<{
    payeeName: string;
    upiId: string;
    amount: number;
    description: string;
  } | null>(null);

  if (!group) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-mono">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-widest">GROUP_NODE_NOT_SYNCED</p>
          <Link href="/split" className="mt-4 border border-primary bg-primary/5 hover:bg-primary text-primary hover:text-black px-5 py-2 text-xs font-bold transition-all uppercase">
            Return to Terminal
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Filter expenses and settlements belonging to this group
  const groupExpenses = expenses.filter(e => e.groupId === group.id);
  const groupSettlements = settlements.filter(s => s.groupId === group.id);

  // Compute net balances
  const netBalances = calculateNetBalances(group, groupExpenses, groupSettlements);
  
  // Compute simplified debts
  const simplifiedDebts = simplifyDebts(group, groupExpenses, groupSettlements);

  // Filter expenses list by search query and category filter
  const filteredExpenses = groupExpenses.filter(expense => {
    const descriptionMatch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
    return descriptionMatch && categoryMatch;
  });

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const triggerCSVExport = () => {
    exportExpensesToCSV(groupExpenses, group.members, group.name);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono relative overflow-hidden pb-24 md:pb-8 pt-16">
      <Header />
      
      {/* CRT scanline simulation */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
      
      {/* Floating arcade graphics background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(0,240,255,0.02)_0%,transparent_70%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Group Header */}
      <header className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 border-b border-primary/20 no-print relative z-30">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link href="/split" className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs">arrow_back</span> [RETURN_TO_SYSTEM]
            </Link>
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase font-headline">
              CHANNEL <span className="text-secondary neon-secondary">{group.name}</span>
            </h1>
            {group.description && (
              <p className="text-gray-500 text-xs lowercase max-w-2xl font-mono">{group.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Invite code */}
            <div className="flex items-center gap-2 border border-primary/20 bg-black px-3.5 py-2 text-xs">
              <span className="text-gray-500 uppercase tracking-wider">INV_SEQ:</span>
              <span className="font-mono text-white select-all font-bold tracking-widest">{group.inviteCode}</span>
              <button 
                onClick={handleCopyInvite}
                className="text-primary hover:text-white transition-colors ml-1.5 font-bold cursor-pointer uppercase tracking-wider"
              >
                {copiedInvite ? '[DONE]' : '[COPY]'}
              </button>
            </div>

            <Link
              href={`/split/groups/${group.id}/add-expense`}
              className="flex items-center gap-2 bg-primary px-4 py-2.5 text-xs font-black text-black hover:bg-white transition-all shadow-[0_0_15px_rgba(255,211,0,0.3)] uppercase tracking-wider font-headline"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span> LOG_SPLIT
            </Link>
          </div>
        </div>
      </header>

      {/* Main layout grid */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 grid gap-8 lg:grid-cols-3 relative z-10">
        
        {/* Left Side: Ledger & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Balances / Debt Simplification Panel */}
          <section className="hud-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-primary/10 pb-2 font-headline">
              <span className="material-symbols-outlined text-lg text-primary">monetization_on</span> MINIMIZD_SETTLEMENTS_MATRIX
            </h2>
            <p className="text-[10px] text-gray-500 uppercase leading-relaxed font-mono">
              Greedy Graph Logic simplifying peer transaction weights. Reduces total transfer frequency.
            </p>

            {simplifiedDebts.length === 0 ? (
              <div className="border border-primary/30 bg-primary/5 p-5 text-center text-xs text-primary font-bold uppercase tracking-wider font-mono">
                🎉 PERFECT DISCHARGE. ALL MEMBERS IN NEUTRAL MATRIX.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {simplifiedDebts.map((debt, idx) => {
                  const debtor = group.members.find(m => m.id === debt.fromUserId);
                  const creditor = group.members.find(m => m.id === debt.toUserId);
                  const isCurrentDebtor = debt.fromUserId === currentUser.id;

                  return (
                    <div 
                      key={idx} 
                      className={`hud-card p-4 flex flex-col justify-between gap-3 ${
                        isCurrentDebtor 
                          ? 'border-error/40 bg-error/5' 
                          : 'border-primary/20 bg-black'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-[10px] font-mono">
                          <p className="font-bold text-gray-500 uppercase">TRANS_QUEUE</p>
                          <p className="text-xs font-bold text-white mt-1 uppercase">
                            {debtor?.name.split(' ')[0]} ➔ {creditor?.name.split(' ')[0]}
                          </p>
                        </div>
                        <span className="text-sm font-black text-white font-mono">₹{debt.amount.toFixed(2)}</span>
                      </div>

                      {isCurrentDebtor && creditor?.upiId ? (
                        <button
                          onClick={() => {
                            setActivePaySettlement({
                              payeeName: creditor.name,
                              upiId: creditor.upiId!,
                              amount: debt.amount,
                              description: `Settle for ${group.name}`
                            });
                          }}
                          className="w-full flex items-center justify-center gap-1.5 bg-primary text-black py-1.5 text-[10px] font-black hover:bg-white transition-all cursor-pointer uppercase tracking-wider font-mono rounded-xl"
                        >
                          <span className="material-symbols-outlined text-sm">qr_code</span> Settle Up via UPI
                        </button>
                      ) : isCurrentDebtor ? (
                        <div className="text-[9px] text-error bg-error/5 border border-error/20 p-2 rounded-xl flex items-center gap-1 font-mono">
                          <span className="material-symbols-outlined text-xs shrink-0">error</span>
                          <span>NO RECEIVING ADDRESS REGISTERED.</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section: Expense Ledger */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-primary/20 pb-3">
              <h2 className="text-sm font-bold tracking-widest text-white uppercase font-headline">EXPENS_HISTORY_LOG</h2>
              
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] uppercase font-bold font-mono">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-1.5 border border-primary/30 bg-black text-primary hover:border-primary px-3 py-1.5 cursor-pointer rounded-xl"
                >
                  <span className="material-symbols-outlined text-sm">description</span> PRINT_PDF
                </button>
                <button
                  onClick={triggerCSVExport}
                  className="flex items-center gap-1.5 border border-primary/30 bg-black text-primary hover:border-primary px-3 py-1.5 cursor-pointer rounded-xl"
                >
                  <span className="material-symbols-outlined text-sm">download</span> DOWNLOAD_CSV
                </button>
              </div>
            </div>

            {/* Search and filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 no-print font-mono">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-primary text-sm">search</span>
                <input
                  type="text"
                  placeholder="SEARCH_LEDGER..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-primary/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                />
              </div>
              <div className="relative flex items-center">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-black border border-primary/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary pr-8 appearance-none font-mono uppercase min-w-[160px]"
                >
                  <option value="all">ALL_CATEGORIES</option>
                  <option value="food">FOOD_SPLIT</option>
                  <option value="travel">TRAVEL_EXPENSE</option>
                  <option value="rent">ROOM_RENT</option>
                  <option value="utilities">UTILITIES</option>
                  <option value="entertainment">ENTERTAINMENT</option>
                  <option value="other">OTHER_DISCHARG</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 text-primary text-sm pointer-events-none">filter_alt</span>
              </div>
            </div>

            {/* List of expenses */}
            {filteredExpenses.length === 0 ? (
              <div className="hud-card p-12 text-center text-xs text-gray-500 uppercase font-mono">
                NO EXPENDITURE ENTRIES FOUND IN NODE HISTORY.
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {filteredExpenses.map((expense) => {
                  const payer = group.members.find(m => m.id === expense.payerId);
                  const isUserPayer = expense.payerId === currentUser.id;
                  
                  const splitShares = calculateNetBalances(group, [expense], []);
                  const userShare = splitShares[currentUser.id] || 0;

                  return (
                    <div 
                      key={expense.id} 
                      className="hud-card p-4 flex items-center justify-between hover:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-9 w-9 items-center justify-center border border-primary/30 bg-primary/5 text-primary font-black text-xs uppercase font-headline">
                          {expense.category.substring(0, 3)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-tight font-mono">{expense.description}</h4>
                          <p className="text-[9px] text-gray-500 mt-1 uppercase">
                            NODE_SOURCE: {payer?.name.split(' ')[0]} • {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-black text-white">₹{expense.amount.toFixed(2)}</p>
                          <p className="text-[8px] text-gray-500 mt-0.5 uppercase tracking-wide">
                            TOTAL
                          </p>
                        </div>
                        
                        <div className="text-right border-l border-primary/10 pl-5 min-w-[80px]">
                          <p className={`text-xs font-bold ${
                            isUserPayer 
                              ? 'text-primary' 
                              : userShare < 0 
                                ? 'text-error' 
                                : 'text-gray-400'
                          }`}>
                            {isUserPayer 
                              ? `+ ₹${(expense.amount + userShare).toFixed(2)}` 
                              : userShare < 0 
                                ? `- ₹${Math.abs(userShare).toFixed(2)}` 
                                : '₹0.00'
                            }
                          </p>
                          <p className="text-[8px] text-gray-500 mt-0.5 uppercase tracking-wide">
                            {isUserPayer ? 'YOU_LENT' : 'YOU_OWE'}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="no-print text-gray-500 hover:text-error transition-colors text-[10px] font-bold p-1 hover:bg-error/5 cursor-pointer"
                          title="Purge Record"
                        >
                          [X]
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* Right Side: Group Members & Ledger Overview */}
        <div className="space-y-6 no-print relative z-10">
          
          {/* Section: Member list */}
          <section className="hud-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-primary/10 pb-2 font-headline">
              <span className="material-symbols-outlined text-lg text-secondary">groups</span> CONNECTED_NODES
            </h2>
            
            <div className="space-y-3 font-mono">
              {group.members.map((member) => {
                const memberBalance = netBalances[member.id] || 0;
                
                return (
                  <div key={member.id} className="flex items-center justify-between border-b border-primary/10 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-7 w-7 rounded-xl object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="h-7 w-7 bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                          {member.name.substring(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white uppercase truncate">{member.name.split(' ')[0]}</p>
                        <p className="text-[8px] text-gray-500 truncate max-w-[120px]" title={member.upiId}>{member.upiId || 'NO_UPI'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold ${
                        memberBalance > 0 
                          ? 'text-primary' 
                          : memberBalance < 0 
                            ? 'text-error' 
                            : 'text-gray-400'
                      }`}>
                        {memberBalance > 0 ? `+ ₹${memberBalance}` : memberBalance < 0 ? `- ₹${Math.abs(memberBalance)}` : 'SETTLED'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

      </main>

      {/* UPI QR PAYMENT MODAL */}
      {activePaySettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="hud-card max-w-sm w-full p-6 text-center space-y-6 relative border-2 border-primary screen-glow font-mono">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2 font-headline">UPI_INTENT_DISPATCH</h3>
            
            <div className="bg-white p-3 rounded-2xl inline-block mx-auto border-2 border-primary">
              <img
                src={generateUPIQRCodeUrl(
                  activePaySettlement.upiId,
                  activePaySettlement.payeeName,
                  activePaySettlement.amount,
                  activePaySettlement.description
                )}
                alt="UPI Payment QR Code"
                className="h-44 w-44 object-contain"
              />
            </div>

            <div className="space-y-1.5 text-[9px] uppercase font-mono">
              <p className="text-gray-500">Scan via BHIM-enabled UPI wallet</p>
              <div className="bg-black border border-primary/20 p-2 text-gray-300 break-all select-all">
                {activePaySettlement.upiId}
              </div>
              <p className="text-xs font-black text-primary mt-2">
                Clearance amount: ₹{activePaySettlement.amount.toFixed(2)}
              </p>
            </div>

            {/* Mobile intent link trigger */}
            <div className="pt-1">
              <a
                href={generateUPILink(
                  activePaySettlement.upiId,
                  activePaySettlement.payeeName,
                  activePaySettlement.amount,
                  activePaySettlement.description
                )}
                className="w-full flex items-center justify-center border border-primary bg-primary text-black py-2.5 text-xs font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(255,211,0,0.5)] transition-all uppercase tracking-wider font-headline rounded-xl"
              >
                Launch Mobile App Natively
              </a>
            </div>

            <button
              onClick={() => {
                addSettlement({
                  groupId: group.id,
                  fromUserId: currentUser.id,
                  toUserId: group.members.find(m => m.name === activePaySettlement.payeeName)?.id || '',
                  amount: activePaySettlement.amount,
                  upiTxnRef: `REF-${Math.floor(100000 + Math.random() * 900000)}`
                });
                setActivePaySettlement(null);
              }}
              className="text-[9px] text-gray-500 hover:text-white underline cursor-pointer uppercase tracking-wider"
            >
              Mark as Pending Confirmation
            </button>

            <button
              onClick={() => setActivePaySettlement(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-white text-xs font-bold"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

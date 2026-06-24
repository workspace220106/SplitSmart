'use client';

import React, { useState, use } from 'react';
import Navbar from '../../../components/Navbar';
import { useSplitStore } from '../../../store/splitStore';
import { simplifyDebts, calculateNetBalances } from '../../../lib/debtSimplifier';
import { exportExpensesToCSV } from '../../../lib/export';
import { generateUPILink, generateUPIQRCodeUrl } from '../../../lib/upi';
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  Coins, 
  AlertCircle,
  QrCode,
  FileText
} from 'lucide-react';
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
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-widest">// GROUP_NODE_NOT_SYNCED</p>
          <Link href="/" className="mt-4 border border-primary bg-primary/5 hover:bg-primary text-primary hover:text-black px-5 py-2 text-xs font-bold transition-all uppercase">
            Return to Terminal
          </Link>
        </div>
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
    <div className="min-h-screen bg-black text-white flex flex-col font-mono relative overflow-hidden">
      
      {/* CRT scanline simulation */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
      
      <Navbar />

      {/* Floating arcade graphics background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(0,240,255,0.02)_0%,transparent_70%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Group Header */}
      <header className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 border-b border-primary/20 no-print relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline uppercase tracking-wider">
              <ArrowLeft className="h-3.5 w-3.5" /> [RETURN_TO_SYSTEM]
            </Link>
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              CHANNEL // <span className="text-secondary neon-secondary">{group.name}</span>
            </h1>
            {group.description && (
              <p className="text-gray-500 text-xs lowercase max-w-2xl">// {group.description}</p>
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
              href={`/groups/${group.id}/add-expense`}
              className="flex items-center gap-2 bg-primary px-4 py-2.5 text-xs font-black text-black hover:bg-white transition-all shadow-[0_0_15px_rgba(255,211,0,0.3)] uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" /> LOG_SPLIT
            </Link>
          </div>
        </div>
      </header>

      {/* Main layout grid */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 grid gap-8 lg:grid-cols-3 relative z-10">
        
        {/* Left Side: Ledger & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Balances / Debt Simplification Panel */}
          <section className="hud-card rounded-none p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-primary/10 pb-2">
              <Coins className="h-4.5 w-4.5 text-primary" /> MINIMIZD_SETTLEMENTS_MATRIX
            </h2>
            <p className="text-[10px] text-gray-500 uppercase leading-relaxed">
              Greedy Graph Logic simplifying peer transaction weights. Reduces total transfer frequency.
            </p>

            {simplifiedDebts.length === 0 ? (
              <div className="border border-primary/30 bg-primary/5 p-5 text-center text-xs text-primary font-bold uppercase tracking-wider">
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
                      className={`hud-card rounded-none p-4 flex flex-col justify-between gap-3 ${
                        isCurrentDebtor 
                          ? 'border-error/40 bg-error/5' 
                          : 'border-primary/20 bg-black'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-[10px]">
                          <p className="font-bold text-gray-500 uppercase">TRANS_QUEUE</p>
                          <p className="text-xs font-bold text-white mt-1 uppercase">
                            {debtor?.name.split(' ')[0]} ➔ {creditor?.name.split(' ')[0]}
                          </p>
                        </div>
                        <span className="text-sm font-black text-white">₹{debt.amount.toFixed(2)}</span>
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
                          className="w-full flex items-center justify-center gap-1.5 bg-primary text-black py-1.5 text-[10px] font-black hover:bg-white transition-all cursor-pointer uppercase tracking-wider"
                        >
                          <QrCode className="h-3.5 w-3.5" /> Settle Up via UPI
                        </button>
                      ) : isCurrentDebtor ? (
                        <div className="text-[9px] text-error bg-error/5 border border-error/20 p-2 rounded-none flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
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
              <h2 className="text-sm font-bold tracking-widest text-white uppercase">EXPENS_HISTORY_LOG</h2>
              
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] uppercase font-bold">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-1.5 border border-primary/30 bg-black text-primary hover:border-primary px-3 py-1.5 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> PRINT_PDF
                </button>
                <button
                  onClick={triggerCSVExport}
                  className="flex items-center gap-1.5 border border-primary/30 bg-black text-primary hover:border-primary px-3 py-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> DOWNLOAD_CSV
                </button>
              </div>
            </div>

            {/* Search and filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 no-print font-mono">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-primary" />
                <input
                  type="text"
                  placeholder="SEARCH_LEDGER..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-primary/30 rounded-none pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                />
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-black border border-primary/30 rounded-none px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary pr-8 appearance-none font-mono uppercase"
                >
                  <option value="all">ALL_CATEGORIES</option>
                  <option value="food">FOOD_SPLIT</option>
                  <option value="travel">TRAVEL_EXPENSE</option>
                  <option value="rent">ROOM_RENT</option>
                  <option value="utilities">UTILITIES</option>
                  <option value="entertainment">ENTERTAINMENT</option>
                  <option value="other">OTHER_DISCHARG</option>
                </select>
                <Filter className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-primary pointer-events-none" />
              </div>
            </div>

            {/* List of expenses */}
            {filteredExpenses.length === 0 ? (
              <div className="hud-card rounded-none p-12 text-center text-xs text-gray-500 uppercase">
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
                      className="hud-card rounded-none p-4 flex items-center justify-between hover:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-9 w-9 items-center justify-center border border-primary/30 bg-primary/5 text-primary font-black text-xs uppercase">
                          {expense.category.substring(0, 3)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-tight">{expense.description}</h4>
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
          <section className="hud-card rounded-none p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-primary/10 pb-2">
              <Users className="h-4.5 w-4.5 text-secondary" /> CONNECTED_NODES
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
                          className="h-7 w-7 rounded-none object-cover border border-gray-700"
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
          <div className="hud-card max-w-sm w-full rounded-none p-6 text-center space-y-6 relative border-2 border-primary screen-glow font-mono">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">// UPI_INTENT_DISPATCH</h3>
            
            <div className="bg-white p-3 rounded-none inline-block mx-auto border-2 border-primary">
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
                className="w-full flex items-center justify-center border border-primary bg-primary text-black py-2.5 text-xs font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(255,211,0,0.5)] transition-all uppercase tracking-wider"
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

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useSplitStore } from '@/store/splitStore';
import { simplifyDebts, calculateNetBalances } from '@/lib/debtSimplifier';
import { generateUPILink, generateUPIQRCodeUrl } from '@/lib/upi';
import Link from 'next/link';

export default function SplitDashboard() {
  const { 
    currentUser, 
    groups, 
    expenses, 
    settlements, 
    createGroup, 
    joinGroup,
    confirmSettlement,
    rejectSettlement,
    usersList,
    addUser,
    checkRecurringExpenses,
    setCurrentUser
  } = useSplitStore();

  // Modal triggers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUpi, setNewUserUpi] = useState('');

  // Selected settlement for payment QR Modal
  const [activePaySettlement, setActivePaySettlement] = useState<{
    id: string;
    payeeName: string;
    upiId: string;
    amount: number;
    description: string;
  } | null>(null);

  // Trigger recurring check on mount
  useEffect(() => {
    checkRecurringExpenses();
  }, [checkRecurringExpenses]);

  // Compute overall statistics for the current user
  let totalOwedToMe = 0;
  let totalIOwe = 0;

  // Filter groups current user belongs to
  const userGroups = groups.filter(g => g.members.some(m => m.id === currentUser.id));

  // Compute net balance in each group
  const groupBalances = userGroups.map(group => {
    const groupExpenses = expenses.filter(e => e.groupId === group.id);
    const groupSettlements = settlements.filter(s => s.groupId === group.id);
    const netBalances = calculateNetBalances(group, groupExpenses, groupSettlements);
    const userNet = netBalances[currentUser.id] || 0;

    if (userNet > 0) {
      totalOwedToMe += userNet;
    } else if (userNet < 0) {
      totalIOwe += Math.abs(userNet);
    }

    return { ...group, userNet };
  });

  const netTotal = totalOwedToMe - totalIOwe;

  // Compile active simplified settlements across all groups
  const pendingPaymentsToMake: Array<{
    id: string;
    groupName: string;
    groupId: string;
    payeeId: string;
    payeeName: string;
    payeeUpi?: string;
    amount: number;
  }> = [];

  userGroups.forEach(group => {
    const groupExpenses = expenses.filter(e => e.groupId === group.id);
    const groupSettlements = settlements.filter(s => s.groupId === group.id);
    const simplified = simplifyDebts(group, groupExpenses, groupSettlements);
    
    simplified.forEach((debt, index) => {
      if (debt.fromUserId === currentUser.id) {
        const payee = group.members.find(m => m.id === debt.toUserId);
        pendingPaymentsToMake.push({
          id: `debt_${group.id}_${index}`,
          groupName: group.name,
          groupId: group.id,
          payeeId: debt.toUserId,
          payeeName: payee ? payee.name : 'Unknown Friend',
          payeeUpi: payee ? payee.upiId : undefined,
          amount: debt.amount
        });
      }
    });
  });

  // Compile pending confirmations
  const incomingSettlementApprovals = settlements.filter(s => 
    s.toUserId === currentUser.id && s.status === 'pending'
  ).map(s => {
    const group = groups.find(g => g.id === s.groupId);
    const sender = usersList.find(u => u.id === s.fromUserId);
    return {
      ...s,
      groupName: group ? group.name : 'Deleted Group',
      senderName: sender ? sender.name : 'Unknown User',
      senderAvatar: sender ? sender.avatar : undefined
    };
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    createGroup(groupName, groupDesc, currentUser.id);
    setGroupName('');
    setGroupDesc('');
    setShowCreateModal(false);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    const joined = joinGroup(inviteCode, currentUser.id);
    if (joined) {
      setInviteCode('');
      setShowJoinModal(false);
    } else {
      alert('Node not found! Verify invite sequence.');
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser(newUserName, newUserEmail, newUserUpi || undefined);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserUpi('');
    setShowUserModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-body pb-24 md:pb-8 pt-16 relative overflow-hidden">
      <Header />

      {/* CRT scanline simulation */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>

      {/* Floating arcade background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(255,211,0,0.03)_0%,transparent_70%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Hero Header */}
      <header className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 relative z-30">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-primary/20 pb-6">
          <div>
            <h1 className="font-headline text-3xl font-black italic tracking-tighter text-white uppercase">
              SPLIT_LEDGER // <span className="text-primary neon-primary">{currentUser.name.split(' ')[0]}</span>
            </h1>
            <p className="font-mono text-zinc-500 text-xs mt-1.5 max-w-md uppercase tracking-wider">
              Resolve balance disputes. Optimize debt weights. Zero transacting logic active.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center relative">
            <Link
              href="/split/recurring"
              className="flex items-center gap-2 border border-primary/40 bg-black px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer uppercase tracking-wider font-mono animate-none"
            >
              <span className="material-symbols-outlined text-sm">schedule</span> DAEMON_CRONS
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowSwitchUserModal(!showSwitchUserModal)}
                className="flex items-center gap-2 border border-primary/40 bg-black px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer uppercase tracking-wider font-mono"
              >
                <span className="material-symbols-outlined text-sm">sync_alt</span> SWITCH_NODE ({currentUser.name.split(' ')[0]})
              </button>
              {showSwitchUserModal && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSwitchUserModal(false)} />
                  <div className="absolute right-0 mt-2 w-64 border-2 border-primary bg-[#050505] p-3.5 shadow-[0_0_30px_rgba(255,211,0,0.25)] z-40 font-mono text-xs">
                    <div className="pb-2.5 border-b border-primary/20 mb-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-primary">// CHOOSE_ACTIVE_NODE</p>
                    </div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {usersList.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setCurrentUser(user);
                            setShowSwitchUserModal(false);
                          }}
                          className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors border ${
                            user.id === currentUser.id
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-transparent text-gray-400 hover:border-secondary hover:text-secondary hover:bg-secondary/5'
                          }`}
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-none object-cover border border-zinc-700 shrink-0 animate-none"
                          />
                          <div className="truncate min-w-0 flex-1">
                            <p className="truncate font-bold uppercase text-[11px] text-white">{user.name}</p>
                            <p className="truncate text-[8px] text-zinc-500 mt-0.5">{user.upiId || 'NO_UPI_DEPOSITED'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 border border-secondary/40 bg-black px-4 py-2 text-xs font-bold text-secondary hover:bg-secondary/5 transition-all cursor-pointer uppercase tracking-wider font-mono animate-none"
            >
              [+] ADD_FRIEND
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 border border-tertiary/40 bg-black px-4 py-2 text-xs font-bold text-tertiary hover:bg-tertiary/5 transition-all cursor-pointer uppercase tracking-wider font-mono animate-none"
            >
              [*] JOIN_GROUP
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-black text-black hover:bg-white transition-all shadow-[0_0_15px_rgba(255,211,0,0.3)] cursor-pointer uppercase tracking-wider font-mono animate-none"
            >
              [+] NEW_GROUP
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 md:px-8 space-y-8 relative z-10">
        
        {/* Balances Bento Summary */}
        <section className="grid gap-6 md:grid-cols-3">
          
          {/* Net balance */}
          <div className="hud-card rounded-none p-5 flex flex-col justify-between relative overflow-hidden min-h-[140px]">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary font-mono">// NET_LEDGER_BALANCE</p>
              <h3 className={`text-3xl font-black mt-3 italic tracking-tight font-headline ${netTotal >= 0 ? 'text-primary neon-primary' : 'text-error'}`}>
                {netTotal >= 0 ? `+ ₹${netTotal.toFixed(2)}` : `- ₹${Math.abs(netTotal).toFixed(2)}`}
              </h3>
            </div>
            <div className="text-[9px] text-zinc-500 uppercase mt-4 tracking-wider font-mono">
              {netTotal >= 0 ? "LEDGER STATUS: DEPOSIT_SURPLUS" : "LEDGER STATUS: TRANSACTION_DECREMENT"}
            </div>
          </div>

          {/* Owed to me */}
          <div className="hud-card rounded-none p-5 flex items-start gap-4 border-l-4 border-l-primary">
            <div className="rounded-none bg-primary/10 p-2.5 text-primary border border-primary/20 mt-1">
              <span className="material-symbols-outlined text-xl">trending_up</span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono">// CREDITOR_MATRIX</p>
              <h3 className="text-2xl font-black mt-2 text-white font-headline">₹{totalOwedToMe.toFixed(2)}</h3>
              <p className="text-[9px] text-zinc-500 mt-1.5 uppercase font-mono">Owed by other network nodes</p>
            </div>
          </div>

          {/* You owe */}
          <div className="hud-card rounded-none p-5 flex items-start gap-4 border-l-4 border-l-error">
            <div className="rounded-none bg-error/10 p-2.5 text-error border border-error/20 mt-1">
              <span className="material-symbols-outlined text-xl">trending_down</span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono">// DEBTOR_MATRIX</p>
              <h3 className="text-2xl font-black mt-2 text-white font-headline">₹{totalIOwe.toFixed(2)}</h3>
              <p className="text-[9px] text-zinc-500 mt-1.5 uppercase font-mono">Requires settlement clearance</p>
            </div>
          </div>

        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Groups list */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <h2 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-lg text-secondary">groups</span> ACTIVE_SECTOR_GROUPS
              </h2>
              <span className="text-[9px] text-secondary font-bold bg-secondary/10 border border-secondary/30 px-2 py-0.5 font-mono">
                {userGroups.length} CHANNELS_SYNCED
              </span>
            </div>

            {userGroups.length === 0 ? (
              <div className="hud-card rounded-none p-12 text-center border-dashed border-primary/20">
                <span className="material-symbols-outlined text-4xl text-primary/40 animate-pulse">groups</span>
                <h3 className="mt-4 text-xs font-bold uppercase tracking-widest text-white font-headline">No active network groups</h3>
                <p className="mt-2 text-[10px] text-zinc-500 max-w-xs mx-auto uppercase font-mono">
                  Boot up a group to share room bills, rent ledger, or Goa trip files.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="border border-secondary/40 bg-black text-secondary hover:bg-secondary/5 px-4 py-2 text-[10px] font-bold cursor-pointer uppercase font-mono"
                  >
                    Connect via code
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary text-black hover:bg-white px-4 py-2 text-[10px] font-bold cursor-pointer uppercase font-mono"
                  >
                    Create channel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {groupBalances.map((group) => (
                  <Link 
                    key={group.id}
                    href={`/split/groups/${group.id}`}
                    className="group relative flex flex-col justify-between hud-card rounded-none p-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-black text-white text-sm group-hover:text-primary transition-colors uppercase tracking-tight font-headline">
                          {group.name}
                        </h3>
                        <span className="text-[8px] font-bold text-secondary bg-secondary/5 border border-secondary/20 px-1.5 py-0.5 font-mono">
                          {group.members.length} NODES
                        </span>
                      </div>
                      {group.description && (
                        <p className="text-[10px] text-zinc-500 mt-2 lowercase leading-relaxed line-clamp-2 font-mono">
                          // {group.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-primary/10 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Node Balance</p>
                        <p className={`text-xs font-bold mt-1 font-mono ${
                          group.userNet > 0 
                            ? 'text-primary' 
                            : group.userNet < 0 
                              ? 'text-error' 
                              : 'text-zinc-400'
                        }`}>
                          {group.userNet > 0 ? `CREDIT: ₹${group.userNet}` : group.userNet < 0 ? `DEBT: ₹${Math.abs(group.userNet)}` : 'SETTLED_NODE'}
                        </p>
                      </div>
                      <div className="border border-primary/20 bg-primary/5 p-1 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column: Actionable settlements and pending approvals */}
          <div className="space-y-6">
            
            {/* Settlements to pay */}
            <div>
              <h2 className="text-sm font-bold tracking-widest text-white mb-3 uppercase flex items-center gap-2 border-b border-primary/20 pb-3 font-headline">
                <span className="material-symbols-outlined text-lg text-primary">send</span> CLEARANCE_MATRIX
              </h2>

              {pendingPaymentsToMake.length === 0 ? (
                <div className="hud-card rounded-none p-5 text-center text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                  🎉 ALL NODES DISCHARGED. NO OUTSTANDING DEBTS.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPaymentsToMake.map((debt, idx) => (
                    <div key={idx} className="hud-card rounded-none p-4 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase font-mono">{debt.groupName}</p>
                          <p className="text-xs font-bold text-white mt-1 uppercase font-mono">
                            Pay Node <span className="text-secondary">{debt.payeeName}</span>
                          </p>
                        </div>
                        <span className="text-xs font-black text-white font-mono">₹{debt.amount.toFixed(2)}</span>
                      </div>
                      
                      {debt.payeeUpi ? (
                        <button
                          onClick={() => {
                            setActivePaySettlement({
                              id: debt.id,
                              payeeName: debt.payeeName,
                              upiId: debt.payeeUpi!,
                              amount: debt.amount,
                              description: `Settle for ${debt.groupName}`
                            });
                          }}
                          className="w-full flex items-center justify-center gap-1.5 border border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary text-primary hover:text-black py-1.5 text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider font-mono"
                        >
                          <span className="material-symbols-outlined text-sm">qr_code</span> Settle via UPI
                        </button>
                      ) : (
                        <div className="border border-error/20 bg-error/5 p-2 text-[9px] text-error flex items-center gap-1 font-mono">
                          <span className="material-symbols-outlined text-sm">error</span>
                          <span>NO UPI DEPOSITED BY payee node.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Confirmations */}
            <div>
              <h2 className="text-sm font-bold tracking-widest text-white mb-3 uppercase flex items-center gap-2 border-b border-primary/20 pb-3 font-headline">
                <span className="material-symbols-outlined text-lg text-tertiary">how_to_reg</span> DISCHARG_APPROVALS
              </h2>

              {incomingSettlementApprovals.length === 0 ? (
                <div className="hud-card rounded-none p-5 text-center text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                  NO PENDING CLEARANCE CERTIFICATES.
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingSettlementApprovals.map((settlement) => (
                    <div key={settlement.id} className="hud-card rounded-none p-4 border border-tertiary/30 bg-tertiary/5 space-y-3">
                      <div className="flex items-center gap-3">
                        {settlement.senderAvatar ? (
                          <img
                            src={settlement.senderAvatar}
                            alt={settlement.senderName}
                            className="h-7 w-7 rounded-none object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="h-7 w-7 bg-zinc-800 flex items-center justify-center text-[9px]">
                            👤
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-zinc-500 font-bold uppercase truncate font-mono">{settlement.groupName}</p>
                          <p className="text-[10px] text-white truncate uppercase font-mono">
                            Node <span className="font-bold">{settlement.senderName}</span> requests clearance:
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-black rounded-none px-3 py-1.5 border border-primary/10 font-mono">
                        <span className="text-[9px] text-zinc-500">Amount:</span>
                        <span className="text-xs font-bold text-primary">₹{settlement.amount.toFixed(2)}</span>
                      </div>

                      {settlement.upiTxnRef && (
                        <div className="text-[8px] text-zinc-500 pt-1.5 flex justify-between border-t border-primary/5 uppercase font-mono">
                          <span>UPI_REF_TXN:</span>
                          <span className="text-zinc-300 font-mono">{settlement.upiTxnRef}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => rejectSettlement(settlement.id)}
                          className="flex-1 flex items-center justify-center gap-1 border border-error bg-error/5 text-error text-[9px] py-1.5 font-bold hover:bg-error hover:text-black transition-colors cursor-pointer uppercase font-mono"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span> Decline
                        </button>
                        <button
                          onClick={() => confirmSettlement(settlement.id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-primary text-black text-[9px] py-1.5 font-black hover:bg-white transition-colors cursor-pointer uppercase font-mono"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* UPI QR PAYMENT MODAL */}
      {activePaySettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="hud-card max-w-sm w-full rounded-none p-6 text-center space-y-6 relative border-2 border-primary screen-glow font-mono">
            <div className="text-[9px] text-primary uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-2">
              // UPI_DEEP_LINK_DISPATCHER
            </div>
            
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

            <div className="space-y-1.5 text-[10px] uppercase font-mono">
              <p className="text-zinc-500">Scan via BHIM-enabled UPI wallet</p>
              <div className="bg-black border border-primary/20 p-2 font-mono text-zinc-300 break-all select-all">
                {activePaySettlement.upiId}
              </div>
              <p className="text-sm font-black text-primary mt-2">
                Settlement value: ₹{activePaySettlement.amount.toFixed(2)}
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

            <div className="pt-2">
              <button
                onClick={() => {
                  const { addSettlement } = useSplitStore.getState();
                  const matchedGroupDebt = activePaySettlement.id.split('_');
                  const groupId = matchedGroupDebt[1] || '';
                  
                  const payee = usersList.find(u => u.name === activePaySettlement.payeeName);
                  if (payee && groupId) {
                    addSettlement({
                      groupId,
                      fromUserId: currentUser.id,
                      toUserId: payee.id,
                      amount: activePaySettlement.amount,
                      upiTxnRef: `REF-${Math.floor(100000 + Math.random() * 900000)}`
                    });
                  }
                  
                  setActivePaySettlement(null);
                }}
                className="text-[9px] text-zinc-500 hover:text-white underline cursor-pointer uppercase tracking-wider"
              >
                Mark as Pending Confirmation
              </button>
            </div>

            <button
              onClick={() => setActivePaySettlement(null)}
              className="absolute top-2 right-3 text-zinc-500 hover:text-white text-xs font-bold"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <form onSubmit={handleCreateGroup} className="hud-card max-w-md w-full rounded-none p-6 space-y-4 relative border-2 border-primary screen-glow font-mono">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">// INIT_NEW_SECTOR_LEDGER</h3>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Channel Name</label>
              <input
                type="text"
                placeholder="e.g. FLAT_204_ROOMIES"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                required
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Node Description (Optional)</label>
              <textarea
                placeholder="e.g. Monthly utilities, internet connection bills, room cleaning splits."
                value={groupDesc}
                onChange={e => setGroupDesc(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary h-20 resize-none font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 text-xs py-2 font-bold cursor-pointer uppercase"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-black hover:bg-white text-xs py-2 font-black transition-all cursor-pointer uppercase"
              >
                Execute
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-2 right-3 text-zinc-500 hover:text-white text-xs font-bold"
            >
              [X]
            </button>
          </form>
        </div>
      )}

      {/* JOIN GROUP MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <form onSubmit={handleJoinGroup} className="hud-card max-w-sm w-full rounded-none p-6 space-y-4 relative border-2 border-primary screen-glow font-mono">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">// SYNC_LEDGER_CHANNEL</h3>
            <p className="text-[9px] text-zinc-500 uppercase">Input the 6-character node sequence shared by the host.</p>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Node Invite Code</label>
              <input
                type="text"
                placeholder="e.g. FLAT20"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary text-center font-bold tracking-widest uppercase font-mono"
                maxLength={8}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 text-xs py-2 font-bold cursor-pointer uppercase"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-black hover:bg-white text-xs py-2 font-black transition-all cursor-pointer uppercase"
              >
                Sync Node
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowJoinModal(false)}
              className="absolute top-2 right-3 text-zinc-500 hover:text-white text-xs font-bold"
            >
              [X]
            </button>
          </form>
        </div>
      )}

      {/* CREATE USER/FRIEND MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <form onSubmit={handleAddFriend} className="hud-card max-w-md w-full rounded-none p-6 space-y-4 relative border-2 border-primary screen-glow font-mono">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">// INITIATE_NEW_NODE_ID</h3>
            <p className="text-[9px] text-zinc-500 uppercase">Deposit a local simulated user onto your workspace grid.</p>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Node / Friend Alias</label>
              <input
                type="text"
                placeholder="e.g. Dev Patel"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Node Email Identifier</label>
              <input
                type="email"
                placeholder="e.g. dev@college.edu"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                required
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Node UPI Address (Receiving)</label>
              <input
                type="text"
                placeholder="e.g. dev@okaxis"
                value={newUserUpi}
                onChange={e => setNewUserUpi(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-none px-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 text-xs py-2 font-bold cursor-pointer uppercase"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-black hover:bg-white text-xs py-2 font-black transition-all cursor-pointer uppercase"
              >
                Register Node
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="absolute top-2 right-3 text-zinc-500 hover:text-white text-xs font-bold"
            >
              [X]
            </button>
          </form>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

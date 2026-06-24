'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { setupNewUserProfile, isUsernameUnique } from '@/services/firebaseService';

export default function SetupProfilePage() {
  const router = useRouter();
  const { firebaseUser, user, logout } = useAuthStore();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if they already have a user doc
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    const cleanUsername = username.trim();
    
    setError(null);
    setChecking(true);
    setLoading(true);

    try {
      if (!firebaseUser) {
        throw new Error('Auth session expired. Please log in again.');
      }

      // 1. Verify uniqueness
      const isUnique = await isUsernameUnique(cleanUsername);
      setChecking(false);

      if (!isUnique) {
        setError('That username is already claimed by another agent. Try another.');
        setLoading(false);
        return;
      }

      // 2. Initialize profile with 500 tokens
      await setupNewUserProfile(
        firebaseUser.uid,
        cleanUsername,
        firebaseUser.email || ''
      );

      // The subscription in authStore will pick up the new user document
      // and update the state automatically, triggering redirect in AuthGuard.
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize profile. Please try again.');
      setLoading(false);
      setChecking(false);
    }
  };

  const handleCancel = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body flex flex-col items-center justify-center p-4 py-8 relative overflow-y-auto">
      {/* CRT Scanline and flicker overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
      
      {/* Background neon grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(0,240,255,0.05)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-4 my-auto">
        <div className="bg-[#0b0b0b] border-2 border-secondary/20 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.1)] relative overflow-hidden">
          
          <div className="flex justify-center mb-5">
            <div className="relative w-16 h-16 flex items-center justify-center bg-zinc-950 border-2 border-secondary rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.35)]">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 18C9.58 18 7.48 16.76 6.25 14.88C6.28 12.98 10.07 11.9 12 11.9C13.93 11.9 17.72 12.98 17.75 14.88C16.52 16.76 14.42 18 12 18Z" fill="#00F0FF" />
              </svg>
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:0.5s]"></div>
            </div>
          </div>

          <h2 className="font-headline text-lg font-black text-center text-secondary uppercase tracking-[0.2em] mb-2">
            INITIALIZE TERMINAL
          </h2>
          <p className="text-zinc-500 text-[11px] font-mono text-center uppercase tracking-wider mb-6">
            ESTABLISHING AGENT PROFILE FOR {firebaseUser?.email}
          </p>

          {error && (
            <div className="mb-6 p-4 border border-error/50 bg-error/10 font-mono text-[11px] text-error rounded-lg uppercase tracking-wide leading-relaxed">
              {error}
            </div>
          )}

          <div className="mb-6 border border-primary/20 bg-primary/5 p-4 rounded-xl font-mono text-[10px] text-primary uppercase tracking-wide leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined font-bold text-sm shrink-0">info</span>
            <div>
              <span>NEW ACCOUNTS ARE GRANTED </span>
              <strong className="text-white font-bold underline">500 PAC-TOKENS</strong>
              <span> STARTING VAULT BALANCE. UNLOCK ARENA TRADING IMMEDIATELY.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                Enter Unique Username
              </label>
              <input
                type="text"
                placeholder="AGENT_NAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="w-full bg-black/60 border border-zinc-800 focus:border-secondary px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-white outline-none transition-all placeholder:text-zinc-700 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full bg-secondary text-black font-headline font-black py-4 uppercase tracking-[0.25em] text-xs hover:bg-white hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-40 rounded-xl cursor-pointer"
            >
              {checking ? (
                <span className="animate-pulse">VERIFYING UNIQUE SYNC...</span>
              ) : loading ? (
                <span className="animate-pulse">ESTABLISHING CONNECTION...</span>
              ) : (
                <>CONFIRM CODES <span className="material-symbols-outlined font-bold text-sm">vpn_key</span></>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-transparent border border-zinc-800 hover:border-zinc-500 text-zinc-500 hover:text-white font-mono text-[10px] py-3.5 uppercase tracking-widest transition-all rounded-xl mt-2 cursor-pointer"
            >
              CANCEL & SIGN OUT
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

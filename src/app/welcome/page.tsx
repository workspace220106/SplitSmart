'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import AnimatedBackground from '@/components/layout/AnimatedBackground';

export default function WelcomePage() {
  const { firebaseUser } = useAuthStore();
  const [timeStr, setTimeStr] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeStr(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-body overflow-hidden flex flex-col items-center justify-center p-6 relative">

      <AnimatedBackground />

      {/* ── Hero Content ── */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">

        {/* Title */}
        <div
          className="relative mb-6 group"
          style={{
            animation: mounted ? 'emerge 0.7s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
            opacity: mounted ? undefined : 0,
            animationDelay: '0.1s',
          }}
        >
          <h1 className="font-headline text-6xl md:text-8xl font-black text-primary italic tracking-tight"
            style={{ textShadow: '0 0 40px rgba(255,211,0,0.35), 0 0 80px rgba(255,211,0,0.15)' }}>
            SPLIT<span className="text-white">SMART</span>
          </h1>
          <p className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase mt-2">
            ARCADE FINANCE MATRIX v4.2
          </p>
        </div>

        {/* Tagline */}
        <p
          className="font-body text-zinc-400 text-base md:text-lg leading-relaxed mb-12 uppercase tracking-[0.2em] max-w-[500px]"
          style={{
            animation: mounted ? 'emerge 0.7s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
            opacity: mounted ? undefined : 0,
            animationDelay: '0.25s',
          }}
        >
          The Retro-Futuristic{' '}
          <span className="text-primary font-bold" style={{ textShadow: '0 0 10px rgba(255,211,0,0.5)' }}>
            Token Exchange
          </span>{' '}
          Matrix for the Elite Gamer.
        </p>

        {/* ── Curved Stat Cards (emerge effect) ── */}
        <div
          className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-12"
          style={{
            animation: mounted ? 'emerge 0.7s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
            opacity: mounted ? undefined : 0,
            animationDelay: '0.4s',
          }}
        >
          {[
            { label: 'GROUPS', value: '∞', accent: '#FFD300', icon: 'groups' },
            { label: 'SETTLE UP', value: '⚡ FAST', accent: '#00F0FF', icon: 'bolt' },
            { label: 'ACCURACY', value: '100%', accent: '#FFB8FF', icon: 'verified' },
          ].map((card) => (
            <div
              key={card.label}
              className="relative rounded-2xl p-4 flex flex-col items-center gap-1 group cursor-default transition-all duration-300"
              style={{
                background: 'rgba(14,14,14,0.85)',
                border: `1px solid ${card.accent}22`,
                backdropFilter: 'blur(16px)',
                boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 ${card.accent}18, 0 0 0 0 ${card.accent}00`,
                transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 ${card.accent}30, 0 0 24px ${card.accent}22`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.02)';
                (e.currentTarget as HTMLElement).style.borderColor = `${card.accent}44`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 ${card.accent}18`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLElement).style.borderColor = `${card.accent}22`;
              }}
            >
              {/* Top glow dot */}
              <div className="w-1 h-1 rounded-full mb-1" style={{ background: card.accent, boxShadow: `0 0 8px ${card.accent}` }} />
              <span className="font-headline text-xl font-black" style={{ color: card.accent }}>{card.value}</span>
              <span className="font-mono text-[9px] text-zinc-600 tracking-[0.3em]">{card.label}</span>
            </div>
          ))}
        </div>

        {/* ── CTA Buttons ── */}
        <div
          className="flex flex-col md:flex-row gap-4 w-full max-w-lg"
          style={{
            animation: mounted ? 'emerge 0.7s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
            opacity: mounted ? undefined : 0,
            animationDelay: '0.55s',
          }}
        >
          <Link
            href={firebaseUser ? '/arena' : '/auth'}
            className="flex-1 relative overflow-hidden font-headline font-black py-5 text-lg uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-3 group rounded-xl"
            style={{
              background: '#FFD300',
              color: '#000',
              boxShadow: '0 4px 24px rgba(255,211,0,0.3), 0 1px 0 rgba(255,255,255,0.2) inset',
              borderRadius: '14px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(255,211,0,0.55), 0 1px 0 rgba(255,255,255,0.3) inset';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(255,211,0,0.3), 0 1px 0 rgba(255,255,255,0.2) inset';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Shine sweep */}
            <div className="absolute top-0 -left-full w-1/3 h-full bg-white/25 skew-x-12 group-hover:translate-x-[500%] transition-transform duration-700 ease-in-out" />
            {firebaseUser ? 'INSERT COIN' : 'START SYSTEM'}
            <span className="material-symbols-outlined font-bold group-hover:translate-x-1.5 transition-transform">play_arrow</span>
          </Link>

          <Link
            href="/split"
            className="flex-1 relative font-headline font-bold py-5 uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-3 group rounded-xl"
            style={{
              background: 'rgba(0,240,255,0.04)',
              color: '#00F0FF',
              border: '1.5px solid rgba(0,240,255,0.2)',
              borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,240,255,0.08)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,240,255,0.15), inset 0 1px 0 rgba(0,240,255,0.15)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.45)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.07)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,240,255,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.2)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.04)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">call_split</span>
            Split Expenses
          </Link>
        </div>

        {/* ── Footer HUD ── */}
        <div
          className="mt-16 w-full flex flex-col md:flex-row justify-between font-mono text-[9px] text-zinc-700 tracking-[0.3em] border-t pt-5 gap-4"
          style={{ borderColor: 'rgba(255,211,0,0.06)', animation: mounted ? 'emerge 0.7s forwards' : 'none', opacity: mounted ? undefined : 0, animationDelay: '0.7s' }}
        >
          <div className="flex gap-8">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ boxShadow: '0 0 6px rgba(255,211,0,0.7)', animation: 'pulse-soft 2s ease-in-out infinite' }} />
              NETWORK_STABLE
            </span>
            <span>BANDWIDTH: 1.2 GB/S</span>
          </div>
          <div className="flex gap-8">
            <span>LOCAL_CLOCK: {timeStr || '12:00:00 PM'}</span>
            <span>CORE_REV: 4.2.0_SPLIT</span>
          </div>
        </div>
      </main>

      {/* CRT scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px]" style={{ animation: 'pulse-soft 3s ease-in-out infinite' }} />
    </div>
  );
}

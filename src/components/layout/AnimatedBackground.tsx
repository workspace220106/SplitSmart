'use client';

import React from 'react';

/**
 * AnimatedBackground
 * Shared retro-cyberpunk background layer used across all inner pages.
 * Uses absolute positioning (same as welcome page) so it stays inside
 * the page container and is not obscured by z-indexed content layers.
 * 
 * The parent page wrapper MUST have: `relative overflow-hidden`
 */
export default function AnimatedBackground() {
  return (
    <>
      {/* ── Animated Background Container ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

        {/* Animated neon grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,211,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,211,0,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'grid-glow 4s ease-in-out infinite',
          }}
        />

        {/* Orb 1 – primary yellow, top-left drift */}
        <div
          className="absolute rounded-full blur-[120px]"
          style={{
            width: '55vw',
            height: '55vw',
            top: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(255,211,0,0.30) 0%, transparent 70%)',
            animation: 'orb-drift 18s ease-in-out infinite',
          }}
        />

        {/* Orb 2 – cyan, bottom-right drift */}
        <div
          className="absolute rounded-full blur-[140px]"
          style={{
            width: '50vw',
            height: '50vw',
            bottom: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.24) 0%, transparent 70%)',
            animation: 'orb-drift-reverse 22s ease-in-out infinite',
          }}
        />

        {/* Orb 3 – pink, mid accent */}
        <div
          className="absolute rounded-full blur-[100px]"
          style={{
            width: '30vw',
            height: '30vw',
            top: '30%',
            right: '15%',
            background: 'radial-gradient(circle, rgba(255,184,255,0.18) 0%, transparent 70%)',
            animation: 'orb-drift 28s ease-in-out infinite reverse',
          }}
        />

        {/* Floating scan line */}
        <div
          className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          style={{ animation: 'scan 6s linear infinite' }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/60"
            style={{
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              left: `${10 + i * 14}%`,
              bottom: `${10 + (i % 3) * 8}%`,
              boxShadow: '0 0 6px rgba(255,211,0,0.8)',
              animation: `particle-float ${6 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 1.1}s`,
            }}
          />
        ))}
      </div>

      {/* CRT scanline overlay — sits above content */}
      <div
        className="fixed inset-0 pointer-events-none z-[999] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px]"
        style={{ animation: 'pulse-soft 3s ease-in-out infinite' }}
      />
    </>
  );
}

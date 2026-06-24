'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle 
} from '@/services/firebaseService';
import { useAuthStore } from '@/store/authStore';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Boot sequence states
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState('INITIALIZING SECURE PORT...');

  useEffect(() => {
    const steps = [
      { progress: 15, text: 'LAUNCHING CREDENTIAL KEYRING...' },
      { progress: 38, text: 'TESTING AUTH CRYPTO SHIELD... OK' },
      { progress: 62, text: 'ESTABLISHING SECURE GATEWAY SOCKET... OK' },
      { progress: 85, text: 'SYNCHRONIZING WITH AUTH_MATRIX... OK' },
      { progress: 100, text: 'OPENING SECURE NODE PORT... READY' },
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setBootProgress(steps[stepIdx].progress);
        setBootText(steps[stepIdx].text);
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 200);
      }
    }, 220); // Smooth and swift retro boot sequence
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      // Successful auth redirects to Split Dashboard
      router.push('/split');
    } catch (err: any) {
      console.error(err);
      // Friendly check if firebase config is missing
      if (err.message && (err.message.includes('API key') || err.message.includes('initialize'))) {
        setError('Firebase Auth is not configured. Please use Demo Sandbox Mode or configure your environment variables.');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/split');
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('API key') || err.message.includes('initialize'))) {
        setError('Firebase Auth is not configured. Please use Demo Sandbox Mode.');
      } else {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setDemoLoading(true);
    setError(null);
    
    // Simulate connection delay
    setTimeout(() => {
      setDemoLoading(false);
      // Redirect straight to Dashboard
      router.push('/split');
    }, 1200);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black text-primary font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* CRT Scanline effect */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
        
        <div className="w-full max-w-md border border-primary p-6 space-y-6 relative screen-glow bg-black">
          <div className="flex justify-between items-center text-[10px] uppercase text-zinc-500 border-b border-primary/20 pb-2">
            <span>[AUTH_BOOT_SEQUENCE]</span>
            <span>REV_4.2.0_SECURE</span>
          </div>

          <div className="space-y-2 text-xs uppercase tracking-wider text-left min-h-[96px]">
            <p className="text-zinc-600">// AUTH_GATEWAY_SYS_V4.2.0</p>
            <p className="text-zinc-400">Connection: SECURE SOCKET SHIELD</p>
            <p className="text-zinc-400">Status: SHIELD ENCRYPTED</p>
            <div className="h-4"></div>
            <p className="font-bold text-primary animate-pulse">{bootText}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full border border-primary/40 bg-zinc-950/50 h-6 p-0.5 flex">
            <div 
              className="bg-primary h-full transition-all duration-200 shadow-[0_0_10px_#FFD300]" 
              style={{ width: `${bootProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-zinc-600">
            <span>SECTOR_SYNC: {bootProgress}%</span>
            <span className="animate-ping font-bold text-secondary">LOADING...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-body flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* CRT Scanline and flicker overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
      
      {/* Background neon grid grids */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(255,211,0,0.05)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-4">
        {/* Glowing Terminal Card */}
        <div className="bg-[#0b0b0b] border-2 border-primary/20 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(255,211,0,0.1)] relative overflow-hidden">
          
          {/* Custom retro-glowing SplitSmart logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 flex items-center justify-center bg-zinc-950 border-2 border-primary rounded-2xl shadow-[0_0_20px_rgba(255,211,0,0.35)]">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Center division bar */}
                <path d="M12 3V21" stroke="#FFD300" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" className="opacity-80"/>
                {/* Left/cyan split branch */}
                <path d="M8 8L4 12L8 16" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12H11" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Right/pink split branch */}
                <path d="M16 16L20 12L16 8" stroke="#FFB8FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 12H20" stroke="#FFB8FF" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {/* Retro HUD sub-pixel corner dots */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse [animation-delay:0.3s]"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse [animation-delay:0.6s]"></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-error rounded-full animate-pulse [animation-delay:0.9s]"></div>
            </div>
          </div>


          {error && (
            <div className="mb-6 p-4 border border-error/50 bg-error/10 font-mono text-[11px] text-error rounded-lg uppercase tracking-wide leading-relaxed">
              {error}
            </div>
          )}

          {/* Social Sign In Button */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || demoLoading}
            className="w-full bg-white text-black font-headline font-black py-3.5 px-4 uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex justify-center items-center gap-3 disabled:opacity-40 rounded-xl"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center justify-between my-6">
            <span className="w-1/5 border-b border-zinc-800"></span>
            <span className="font-mono text-[9px] uppercase text-zinc-600 tracking-[0.3em]">System_Split</span>
            <span className="w-1/5 border-b border-zinc-800"></span>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || demoLoading}
                  className="w-full bg-black/60 border border-zinc-800 focus:border-primary px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-white outline-none transition-all placeholder:text-zinc-700 rounded-xl"
                />
              </div>
            )}

            <div className="relative group">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || demoLoading}
                className="w-full bg-black/60 border border-zinc-800 focus:border-primary px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-white outline-none transition-all placeholder:text-zinc-700 rounded-xl"
              />
            </div>

            <div className="relative group">
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || demoLoading}
                className="w-full bg-black/60 border border-zinc-800 focus:border-primary px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-white outline-none transition-all placeholder:text-zinc-700 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full bg-primary text-black font-headline font-black py-4 uppercase tracking-[0.25em] text-xs hover:bg-white hover:shadow-[0_0_25px_rgba(255,211,0,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-40 rounded-xl mt-6 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">PROCESSING CONNECTION...</span>
              ) : isSignUp ? (
                <>INITIALIZE ACCOUNT <span className="material-symbols-outlined font-bold text-sm">rocket_launch</span></>
              ) : (
                <>SIGN IN <span className="material-symbols-outlined font-bold text-sm">login</span></>
              )}
            </button>
          </form>

          {/* Sandbox Fallback Mode */}
          <div className="mt-4 pt-2 border-t border-zinc-900">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading || demoLoading}
              className="w-full bg-transparent border border-secondary/30 hover:border-secondary hover:bg-secondary/5 text-secondary font-mono text-[10px] py-3.5 uppercase tracking-widest transition-all rounded-xl"
            >
              {demoLoading ? (
                <span className="animate-ping font-bold">BOOTING SANDBOX...</span>
              ) : (
                'ENTER IN DEMO SANDBOX MODE'
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-mono text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
            >
              {isSignUp ? 'Already registered? Log in →' : 'No account? Register terminal →'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

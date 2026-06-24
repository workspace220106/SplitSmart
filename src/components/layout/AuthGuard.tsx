'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import FloatingChatbot from '@/components/agent/FloatingChatbot';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  const isSetupProfilePage = pathname === '/setup-profile';
  const { firebaseUser, user, isLoading, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize the auth listener on mount
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!firebaseUser) {
      // If not logged in and not on the auth page, redirect to /auth
      if (!isAuthPage) {
        router.push('/auth');
      }
    } else {
      // If logged in but the Firestore profile does not exist, redirect to /setup-profile
      if (!user) {
        if (!isSetupProfilePage) {
          router.push('/setup-profile');
        }
      } else {
        // If logged in, profile exists, and on auth or setup-profile page, redirect to /
        if (isAuthPage || isSetupProfilePage) {
          router.push('/');
        }
      }
    }
  }, [firebaseUser, user, isInitialized, isLoading, pathname, router, isAuthPage, isSetupProfilePage]);

  // Show a dark screen loader while checking authentication state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-black text-primary font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
        <div className="w-full max-w-xs border border-primary/20 p-6 space-y-4 text-center bg-black">
          <span className="animate-ping font-bold text-xs uppercase text-primary">SECURE_SYNCING...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {firebaseUser && !isAuthPage && <FloatingChatbot />}
    </>
  );
}

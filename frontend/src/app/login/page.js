'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store';

export default function Login() {
  const router = useRouter();
  const { isAuthenticated, recoverWallet, error, isLoading } = useStore();
  const [recoveryPhrase, setRecoveryPhrase] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleRecoverWallet = async (e) => {
    e.preventDefault();
    
    if (!recoveryPhrase.trim()) {
      return;
    }
    
    try {
      await recoverWallet(recoveryPhrase);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to recover wallet:', err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Recover Your Wallet</h1>
        
        <form onSubmit={handleRecoverWallet} className="space-y-6">
          <div>
            <label htmlFor="recovery-phrase" className="block text-sm font-medium text-primary-300 mb-2">
              Recovery Phrase
            </label>
            <textarea
              id="recovery-phrase"
              className="input font-mono"
              placeholder="Enter your 12-word recovery phrase"
              rows={3}
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-primary-400">
              Enter the 12-word recovery phrase you received when creating your wallet.
            </p>
          </div>
          
          <button 
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading || !recoveryPhrase.trim()}
          >
            {isLoading ? 'Recovering...' : 'Recover Wallet'}
          </button>
          
          {error && (
            <div className="bg-red-900/50 border border-red-800 p-3 rounded-md text-sm text-red-200">
              {error}
            </div>
          )}
          
          <div className="text-center text-sm text-primary-400">
            Don't have a wallet yet?{' '}
            <Link href="/register" className="link">
              Create one here
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
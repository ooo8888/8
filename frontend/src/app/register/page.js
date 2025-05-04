'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store';

export default function Register() {
  const router = useRouter();
  const { isAuthenticated, createWallet, error, isLoading } = useStore();
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleCreateWallet = async () => {
    try {
      const data = await createWallet();
      setRecoveryPhrase(data.recoveryPhrase);
      setShowRecovery(true);
    } catch (err) {
      console.error('Failed to create wallet:', err);
    }
  };

  const handleCopyRecovery = () => {
    navigator.clipboard.writeText(recoveryPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmRecovery = () => {
    setConfirmed(true);
    // Redirect to dashboard after confirmation
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Wallet</h1>
        
        {!showRecovery ? (
          <div className="space-y-6">
            <p className="text-sm text-primary-300 mb-4">
              Create an anonymous wallet to start using EXITLINK OMEGA. No email, no password, just a 12-word recovery phrase.
            </p>
            
            <button 
              className="btn btn-primary w-full"
              onClick={handleCreateWallet}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Wallet'}
            </button>
            
            {error && (
              <div className="bg-red-900/50 border border-red-800 p-3 rounded-md text-sm text-red-200">
                {error}
              </div>
            )}
            
            <div className="text-center text-sm text-primary-400">
              Already have a wallet?{' '}
              <Link href="/login" className="link">
                Recover it here
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-primary-900 border border-primary-700 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-primary-300">Your Recovery Phrase</h3>
                <button 
                  className="text-xs text-accent-400 hover:text-accent-300"
                  onClick={handleCopyRecovery}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-sm break-all bg-primary-800 p-3 rounded border border-primary-700">
                {recoveryPhrase}
              </p>
            </div>
            
            <div className="bg-yellow-900/30 border border-yellow-800/50 p-3 rounded-md text-sm text-yellow-200">
              <strong>IMPORTANT:</strong> Write down this recovery phrase and keep it safe. It's the only way to recover your wallet. We cannot recover it for you if lost.
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="confirm" 
                className="rounded bg-primary-700 border-primary-600 text-accent-500 focus:ring-accent-500"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm" className="text-sm text-primary-300">
                I have safely stored my recovery phrase
              </label>
            </div>
            
            <button 
              className="btn btn-primary w-full"
              onClick={handleConfirmRecovery}
              disabled={!confirmed}
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
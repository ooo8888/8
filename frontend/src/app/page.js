'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If authenticated, redirect to dashboard
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-primary-700 bg-gradient-to-b from-primary-800 pb-6 pt-8 backdrop-blur-2xl">
          <code className="font-mono font-bold">EXITLINK OMEGA</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-primary-900 via-primary-900 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <div className="flex space-x-4">
            <Link href="/login" className="link">
              Login
            </Link>
            <Link href="/register" className="link">
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-accent-400">EXITLINK</span> OMEGA
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Send it once. Nobody traces it. Not even us.
          </p>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
            <Link href="/register" className="btn btn-primary">
              Create Free Wallet
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Recover Wallet
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">
        <div className="card group">
          <h2 className="mb-3 text-2xl font-semibold">
            Military-Grade Security
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            AES-256 encryption with optional post-quantum wrapper. Zero-trace storage with payload fragments in RAM.
          </p>
        </div>

        <div className="card group">
          <h2 className="mb-3 text-2xl font-semibold">
            Self-Destructing Links
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Links vanish after view count, timer, region mismatch, device mismatch, or screenshot attempt.
          </p>
        </div>

        <div className="card group">
          <h2 className="mb-3 text-2xl font-semibold">
            Crypto Payments
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Pay with Bitcoin, Ethereum, Litecoin, Solana, Monero, or XRP. No personal data, no email, no password.
          </p>
        </div>
      </div>
    </main>
  );
}
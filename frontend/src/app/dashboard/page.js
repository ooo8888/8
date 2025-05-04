'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store';

export default function Dashboard() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    walletId, 
    credits, 
    links,
    getWalletInfo, 
    getLinks,
    logout,
    isLoading 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('links');

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Load wallet info and links
    getWalletInfo();
    getLinks();
  }, [isAuthenticated, router, getWalletInfo, getLinks]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-primary-800 border-b border-primary-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">
              <span className="text-accent-400">EXITLINK</span> OMEGA
            </h1>
            <div className="hidden md:flex items-center space-x-2 bg-primary-900 px-3 py-1 rounded-full text-xs">
              <span className="text-primary-400">Wallet:</span>
              <span className="font-mono truncate max-w-[120px]">{walletId}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-primary-900 px-3 py-1 rounded-full flex items-center space-x-2">
              <span className="text-accent-400 font-semibold">{credits}</span>
              <span className="text-primary-400 text-xs">credits</span>
            </div>
            
            <button 
              className="btn btn-secondary text-sm py-1"
              onClick={() => router.push('/dashboard/buy-credits')}
            >
              Buy Credits
            </button>
            
            <button 
              className="text-primary-400 hover:text-primary-300 text-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto p-4 flex-1">
        {/* Tabs */}
        <div className="flex border-b border-primary-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'links' 
                ? 'border-b-2 border-accent-500 text-accent-400' 
                : 'text-primary-400 hover:text-primary-300'
            }`}
            onClick={() => setActiveTab('links')}
          >
            My Links
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'create' 
                ? 'border-b-2 border-accent-500 text-accent-400' 
                : 'text-primary-400 hover:text-primary-300'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Link
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'transactions' 
                ? 'border-b-2 border-accent-500 text-accent-400' 
                : 'text-primary-400 hover:text-primary-300'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>
        
        {/* Tab content */}
        {activeTab === 'links' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Links</h2>
              <button 
                className="btn btn-primary text-sm"
                onClick={() => setActiveTab('create')}
              >
                Create New Link
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-primary-400">Loading links...</div>
              </div>
            ) : links.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-primary-400 mb-4">You haven't created any links yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('create')}
                >
                  Create Your First Link
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                  <div key={link.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        link.active 
                          ? 'bg-accent-900/30 text-accent-400 border border-accent-800/50' 
                          : 'bg-red-900/30 text-red-400 border border-red-800/50'
                      }`}>
                        {link.active ? 'Active' : 'Destroyed'}
                      </span>
                      <span className="text-xs text-primary-400">
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="font-mono text-sm bg-primary-900 p-2 rounded mb-3 truncate">
                      {`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:12000'}/v/${link.id}`}
                    </div>
                    
                    <div className="flex justify-between text-xs text-primary-400">
                      <span>Type: {link.type}</span>
                      <span>Views: {link.views}/{link.max_views}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'create' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Link</h2>
            <div className="card">
              <p className="text-primary-400 mb-4">
                This feature will be implemented soon. You'll be able to create self-destructing links for text, files, and more.
              </p>
              <Link href="/dashboard/create-link" className="btn btn-primary">
                Go to Link Creator
              </Link>
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            <div className="card">
              <p className="text-primary-400 mb-4">
                This feature will be implemented soon. You'll be able to view your credit transaction history here.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { api } from '@/lib/api';

/**
 * Hook for handling authentication state
 */
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { setWallet, setCredits, reset } = useStore();
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await api.get('/api/wallet');
        
        if (response.data.success) {
          setWallet(response.data.wallet);
          setCredits(response.data.credits);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          reset();
          setError(response.data.error);
        }
      } catch (err) {
        localStorage.removeItem('token');
        reset();
        setError(err.response?.data?.error || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [setWallet, setCredits, reset]);
  
  /**
   * Create a new wallet
   * @returns {Promise<string>} Recovery phrase
   */
  const createWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/wallet/create');
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setWallet(response.data.wallet);
        setIsAuthenticated(true);
        return response.data.wallet.recoveryPhrase;
      } else {
        setError(response.data.error);
        return null;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create wallet');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Recover a wallet using recovery phrase
   * @param {string} recoveryPhrase 12-word recovery phrase
   */
  const recoverWallet = async (recoveryPhrase) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/wallet/recover', { recoveryPhrase });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setWallet(response.data.wallet);
        setIsAuthenticated(true);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to recover wallet');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Log out the current user
   */
  const logout = () => {
    localStorage.removeItem('token');
    reset();
    setIsAuthenticated(false);
  };
  
  return {
    loading,
    error,
    isAuthenticated,
    createWallet,
    recoverWallet,
    logout
  };
}

/**
 * Hook to require authentication for a page
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);
  
  return { loading, isAuthenticated };
}
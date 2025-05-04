import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../lib/api';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      walletId: null,
      credits: 0,
      transactions: [],
      links: [],
      
      // UI state
      isLoading: false,
      error: null,
      
      // Auth actions
      createWallet: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.createWallet();
          localStorage.setItem('token', data.token);
          set({ 
            isAuthenticated: true, 
            walletId: data.walletId, 
            credits: data.credits,
            isLoading: false 
          });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to create wallet' 
          });
          throw error;
        }
      },
      
      recoverWallet: async (recoveryPhrase) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.recoverWallet(recoveryPhrase);
          localStorage.setItem('token', data.token);
          set({ 
            isAuthenticated: true, 
            walletId: data.walletId, 
            credits: data.credits,
            isLoading: false 
          });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to recover wallet' 
          });
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ 
          isAuthenticated: false, 
          walletId: null, 
          credits: 0,
          transactions: [],
          links: []
        });
      },
      
      // Wallet actions
      getWalletInfo: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.getWalletInfo();
          set({ 
            walletId: data.walletId, 
            credits: data.credits,
            transactions: data.transactions,
            isLoading: false 
          });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to get wallet info' 
          });
          throw error;
        }
      },
      
      // Link actions
      createLink: async (content, type, options) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.createLink(content, type, options);
          set({ isLoading: false });
          // Update credits after creating a link
          get().getBalance();
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to create link' 
          });
          throw error;
        }
      },
      
      getLinks: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.getLinks();
          set({ links: data.links, isLoading: false });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to get links' 
          });
          throw error;
        }
      },
      
      // Credit actions
      addCredits: async (amount, paymentMethod) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.addCredits(amount, paymentMethod);
          set({ credits: data.newBalance, isLoading: false });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to add credits' 
          });
          throw error;
        }
      },
      
      getBalance: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.getBalance();
          set({ credits: data.balance, isLoading: false });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to get balance' 
          });
          throw error;
        }
      },
      
      getTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.getTransactions();
          set({ transactions: data.transactions, isLoading: false });
          return data;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Failed to get transactions' 
          });
          throw error;
        }
      },
      
      // UI actions
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'exitlink-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        walletId: state.walletId,
        credits: state.credits
      })
    }
  )
);

export default useStore;
import { renderHook, act } from '@testing-library/react';
import { useAuth, useRequireAuth } from '@/hooks/auth';
import useStore from '@/store';
import * as api from '@/lib/api';

// Mock the store
jest.mock('@/store', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the API service
jest.mock('@/lib/api', () => ({
  getWalletInfo: jest.fn(),
  createWallet: jest.fn(),
  recoverWallet: jest.fn()
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('Authentication Hooks', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Setup default store mock
    useStore.mockReturnValue({
      isAuthenticated: false,
      walletId: null,
      credits: 0,
      setLoading: jest.fn(),
      setError: jest.fn(),
      reset: jest.fn()
    });
  });

  describe('useAuth', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('checks authentication status on mount', async () => {
      // Mock localStorage to return a token
      window.localStorage.getItem.mockReturnValueOnce('test-token');
      
      // Mock API to return wallet data
      api.getWalletInfo.mockResolvedValueOnce({
        success: true,
        walletId: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        credits: 100
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useAuth());
      
      // Wait for the hook to finish loading
      await waitForNextUpdate();
      
      // Verify localStorage was checked
      expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
      
      // Verify API was called
      expect(api.getWalletInfo).toHaveBeenCalled();
      
      // Verify store was updated
      expect(useStore().setWallet).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      });
      expect(useStore().setCredits).toHaveBeenCalledWith(100);
      
      // Verify hook state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('handles authentication failure', async () => {
      // Mock localStorage to return a token
      window.localStorage.getItem.mockReturnValueOnce('test-token');
      
      // Mock API to return error
      api.getWalletInfo.mockRejectedValueOnce({
        response: {
          data: {
            success: false,
            error: 'Invalid token'
          }
        }
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useAuth());
      
      // Wait for the hook to finish loading
      await waitForNextUpdate();
      
      // Verify localStorage was checked and token was removed
      expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      
      // Verify store was reset
      expect(useStore().reset).toHaveBeenCalled();
      
      // Verify hook state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Invalid token');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('handles no token', async () => {
      // Mock localStorage to return null
      window.localStorage.getItem.mockReturnValueOnce(null);
      
      const { result, waitForNextUpdate } = renderHook(() => useAuth());
      
      // Wait for the hook to finish loading
      await waitForNextUpdate();
      
      // Verify localStorage was checked
      expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
      
      // Verify API was not called
      expect(api.getWalletInfo).not.toHaveBeenCalled();
      
      // Verify hook state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('creates a new wallet', async () => {
      // Mock API to return new wallet
      api.createWallet.mockResolvedValueOnce({
        success: true,
        walletId: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        recoveryPhrase: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
        token: 'new-token'
      });
      
      const { result } = renderHook(() => useAuth());
      
      // Call createWallet
      let recoveryPhrase;
      await act(async () => {
        recoveryPhrase = await result.current.createWallet();
      });
      
      // Verify API was called
      expect(api.createWallet).toHaveBeenCalled();
      
      // Verify localStorage was updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      
      // Verify store was updated
      expect(useStore().setWallet).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        recoveryPhrase: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'
      });
      
      // Verify recovery phrase was returned
      expect(recoveryPhrase).toBe('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
      
      // Verify hook state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('recovers a wallet', async () => {
      // Mock API to return recovered wallet
      api.recoverWallet.mockResolvedValueOnce({
        success: true,
        walletId: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        token: 'recovered-token'
      });
      
      const { result } = renderHook(() => useAuth());
      
      // Call recoverWallet
      await act(async () => {
        await result.current.recoverWallet('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
      });
      
      // Verify API was called
      expect(api.recoverWallet).toHaveBeenCalledWith('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
      
      // Verify localStorage was updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'recovered-token');
      
      // Verify store was updated
      expect(useStore().setWallet).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      });
      
      // Verify hook state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('logs out', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Call logout
      act(() => {
        result.current.logout();
      });
      
      // Verify localStorage was cleared
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      
      // Verify store was reset
      expect(useStore().reset).toHaveBeenCalled();
      
      // Verify hook state
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useRequireAuth', () => {
    it('redirects to login if not authenticated', async () => {
      // Mock router
      const push = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
      
      // Mock useAuth to return not authenticated
      jest.spyOn(require('@/hooks/auth'), 'useAuth').mockReturnValue({
        loading: false,
        error: null,
        isAuthenticated: false
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useRequireAuth());
      
      // Wait for the hook to finish
      await waitForNextUpdate();
      
      // Verify redirect
      expect(push).toHaveBeenCalledWith('/login');
    });

    it('does not redirect if authenticated', async () => {
      // Mock router
      const push = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
      
      // Mock useAuth to return authenticated
      jest.spyOn(require('@/hooks/auth'), 'useAuth').mockReturnValue({
        loading: false,
        error: null,
        isAuthenticated: true
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useRequireAuth());
      
      // Wait for the hook to finish
      await waitForNextUpdate();
      
      // Verify no redirect
      expect(push).not.toHaveBeenCalled();
    });

    it('waits for loading to complete before redirecting', async () => {
      // Mock router
      const push = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
      
      // Mock useAuth to return loading first, then not authenticated
      const useAuthMock = jest.spyOn(require('@/hooks/auth'), 'useAuth');
      useAuthMock.mockReturnValueOnce({
        loading: true,
        error: null,
        isAuthenticated: false
      }).mockReturnValueOnce({
        loading: false,
        error: null,
        isAuthenticated: false
      });
      
      const { result, rerender, waitForNextUpdate } = renderHook(() => useRequireAuth());
      
      // Verify no redirect while loading
      expect(push).not.toHaveBeenCalled();
      
      // Trigger re-render with updated auth state
      rerender();
      
      // Wait for the hook to finish
      await waitForNextUpdate();
      
      // Verify redirect after loading completes
      expect(push).toHaveBeenCalledWith('/login');
    });
  });
});
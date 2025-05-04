// Import jest-dom for DOM matchers
import '@testing-library/jest-dom';

// Mock the next/router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock the next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock the zustand store
jest.mock('../src/store', () => ({
  __esModule: true,
  default: () => ({
    isAuthenticated: false,
    walletId: null,
    credits: 0,
    transactions: [],
    links: [],
    isLoading: false,
    error: null,
    createWallet: jest.fn(),
    recoverWallet: jest.fn(),
    logout: jest.fn(),
    getWalletInfo: jest.fn(),
    createLink: jest.fn(),
    getLinks: jest.fn(),
    addCredits: jest.fn(),
    getBalance: jest.fn(),
    getTransactions: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    setLoading: jest.fn(),
  }),
}));
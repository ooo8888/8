import { act, renderHook } from '@testing-library/react';
import { useStore } from '../src/store';

describe('Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useStore.setState({
        wallet: null,
        credits: 0,
        links: [],
        loading: false,
        error: null
      });
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useStore());
    
    expect(result.current.wallet).toBeNull();
    expect(result.current.credits).toBe(0);
    expect(result.current.links).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets wallet', () => {
    const { result } = renderHook(() => useStore());
    
    const wallet = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      address: '0x1234567890abcdef1234567890abcdef12345678'
    };
    
    act(() => {
      result.current.setWallet(wallet);
    });
    
    expect(result.current.wallet).toEqual(wallet);
  });

  it('sets credits', () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.setCredits(100);
    });
    
    expect(result.current.credits).toBe(100);
  });

  it('sets links', () => {
    const { result } = renderHook(() => useStore());
    
    const links = [
      {
        id: 'abcdef123456',
        url: 'http://localhost:12000/v/abcdef123456',
        type: 'text',
        options: {
          maxViews: 1,
          expiresAt: '2025-05-04T12:34:56.789Z'
        },
        createdAt: '2025-05-03T12:34:56.789Z'
      }
    ];
    
    act(() => {
      result.current.setLinks(links);
    });
    
    expect(result.current.links).toEqual(links);
  });

  it('adds a link', () => {
    const { result } = renderHook(() => useStore());
    
    const link = {
      id: 'abcdef123456',
      url: 'http://localhost:12000/v/abcdef123456',
      type: 'text',
      options: {
        maxViews: 1,
        expiresAt: '2025-05-04T12:34:56.789Z'
      },
      createdAt: '2025-05-03T12:34:56.789Z'
    };
    
    act(() => {
      result.current.addLink(link);
    });
    
    expect(result.current.links).toEqual([link]);
    
    // Add another link
    const link2 = {
      id: 'ghijkl789012',
      url: 'http://localhost:12000/v/ghijkl789012',
      type: 'file',
      options: {
        maxViews: 2,
        expiresAt: '2025-05-05T12:34:56.789Z'
      },
      createdAt: '2025-05-03T13:34:56.789Z'
    };
    
    act(() => {
      result.current.addLink(link2);
    });
    
    expect(result.current.links).toEqual([link, link2]);
  });

  it('removes a link', () => {
    const { result } = renderHook(() => useStore());
    
    const links = [
      {
        id: 'abcdef123456',
        url: 'http://localhost:12000/v/abcdef123456',
        type: 'text'
      },
      {
        id: 'ghijkl789012',
        url: 'http://localhost:12000/v/ghijkl789012',
        type: 'file'
      }
    ];
    
    act(() => {
      result.current.setLinks(links);
    });
    
    act(() => {
      result.current.removeLink('abcdef123456');
    });
    
    expect(result.current.links).toEqual([links[1]]);
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.loading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('sets error state', () => {
    const { result } = renderHook(() => useStore());
    
    const error = 'Something went wrong';
    
    act(() => {
      result.current.setError(error);
    });
    
    expect(result.current.error).toBe(error);
    
    act(() => {
      result.current.setError(null);
    });
    
    expect(result.current.error).toBeNull();
  });

  it('resets the store', () => {
    const { result } = renderHook(() => useStore());
    
    // Set some values
    act(() => {
      result.current.setWallet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      });
      result.current.setCredits(100);
      result.current.setLinks([
        {
          id: 'abcdef123456',
          url: 'http://localhost:12000/v/abcdef123456',
          type: 'text'
        }
      ]);
      result.current.setLoading(true);
      result.current.setError('Some error');
    });
    
    // Reset the store
    act(() => {
      result.current.reset();
    });
    
    // Verify default values
    expect(result.current.wallet).toBeNull();
    expect(result.current.credits).toBe(0);
    expect(result.current.links).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
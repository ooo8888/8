import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../src/app/dashboard/page';
import { useStore } from '../src/store';

// Mock the store
jest.mock('../src/store', () => ({
  useStore: jest.fn()
}));

// Mock the API service
jest.mock('../src/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        links: [
          {
            id: 'abcdef123456',
            url: 'http://localhost:12000/v/abcdef123456',
            type: 'text',
            options: {
              maxViews: 1,
              expiresAt: '2025-05-04T12:34:56.789Z',
              hasPassword: false,
              blockScreenshot: true,
              regionLock: null,
              deviceLock: false,
              camouflage: null
            },
            createdAt: '2025-05-03T12:34:56.789Z',
            views: 0,
            status: 'active'
          }
        ]
      }
    })
  }
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Setup mock store
    useStore.mockReturnValue({
      wallet: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      credits: 100,
      links: [],
      loading: false,
      error: null,
      setLinks: jest.fn()
    });
  });

  it('renders the dashboard header', () => {
    render(<Dashboard />);
    
    // Check for the dashboard heading
    expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument();
    
    // Check for wallet address
    expect(screen.getByText(/0x1234/)).toBeInTheDocument();
    
    // Check for credits display
    expect(screen.getByText(/100 credits/i)).toBeInTheDocument();
  });

  it('renders the create link button', () => {
    render(<Dashboard />);
    
    // Check for create link button
    const createButton = screen.getByRole('button', { name: /Create Link/i });
    expect(createButton).toBeInTheDocument();
  });

  it('renders the links section', async () => {
    render(<Dashboard />);
    
    // Check for links heading
    expect(screen.getByRole('heading', { name: /Your Links/i })).toBeInTheDocument();
    
    // Check for link item (after API call resolves)
    expect(await screen.findByText(/abcdef123456/i)).toBeInTheDocument();
  });

  it('displays link details', async () => {
    render(<Dashboard />);
    
    // Wait for link to appear
    const linkItem = await screen.findByText(/abcdef123456/i);
    expect(linkItem).toBeInTheDocument();
    
    // Check for link details
    expect(screen.getByText(/text/i)).toBeInTheDocument();
    expect(screen.getByText(/1 view/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('handles no links state', () => {
    // Override the mock to return empty links array
    useStore.mockReturnValue({
      wallet: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      credits: 100,
      links: [],
      loading: false,
      error: null,
      setLinks: jest.fn()
    });
    
    render(<Dashboard />);
    
    // Check for no links message
    expect(screen.getByText(/You haven't created any links yet/i)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    // Override the mock to show loading state
    useStore.mockReturnValue({
      wallet: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      credits: 100,
      links: [],
      loading: true,
      error: null,
      setLinks: jest.fn()
    });
    
    render(<Dashboard />);
    
    // Check for loading indicator
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('handles error state', () => {
    // Override the mock to show error state
    useStore.mockReturnValue({
      wallet: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      credits: 100,
      links: [],
      loading: false,
      error: 'Failed to load links',
      setLinks: jest.fn()
    });
    
    render(<Dashboard />);
    
    // Check for error message
    expect(screen.getByText(/Failed to load links/i)).toBeInTheDocument();
  });
});
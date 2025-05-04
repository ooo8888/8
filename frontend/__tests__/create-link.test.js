import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateLink from '../src/app/create-link/page';
import { useStore } from '../src/store';
import { api } from '../src/lib/api';

// Mock the store
jest.mock('../src/store', () => ({
  useStore: jest.fn()
}));

// Mock the API service
jest.mock('../src/lib/api', () => ({
  api: {
    post: jest.fn()
  }
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('Create Link Page', () => {
  beforeEach(() => {
    // Setup mock store
    useStore.mockReturnValue({
      wallet: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '0x1234567890abcdef1234567890abcdef12345678'
      },
      credits: 100,
      loading: false,
      error: null,
      setLoading: jest.fn(),
      setError: jest.fn()
    });
    
    // Reset API mock
    api.post.mockReset();
  });

  it('renders the create link form', () => {
    render(<CreateLink />);
    
    // Check for the form heading
    expect(screen.getByRole('heading', { name: /Create Link/i })).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByLabelText(/Content Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Views/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expires In/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Block Screenshot/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  it('handles form submission for text link', async () => {
    // Setup API mock to return success
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        link: {
          id: 'abcdef123456',
          url: 'http://localhost:12000/v/abcdef123456',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
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
          creditsCost: 3
        }
      }
    });
    
    render(<CreateLink />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Content Type/i), { target: { value: 'text' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a secret message' } });
    fireEvent.change(screen.getByLabelText(/Max Views/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Expires In/i), { target: { value: '86400' } });
    fireEvent.click(screen.getByLabelText(/Block Screenshot/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/link/create', {
        type: 'text',
        content: 'This is a secret message',
        options: {
          maxViews: 1,
          expiresIn: 86400,
          password: '',
          blockScreenshot: true,
          regionLock: null,
          deviceLock: false,
          camouflage: null
        }
      });
    });
    
    // Check for success message
    expect(await screen.findByText(/Link created successfully/i)).toBeInTheDocument();
    
    // Check for link URL display
    expect(screen.getByText(/http:\/\/localhost:12000\/v\/abcdef123456/i)).toBeInTheDocument();
    
    // Check for QR code
    expect(screen.getByAltText(/QR Code/i)).toBeInTheDocument();
  });

  it('handles form submission for file link', async () => {
    // Setup API mock to return success
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        link: {
          id: 'abcdef123456',
          url: 'http://localhost:12000/v/abcdef123456',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          type: 'file',
          options: {
            maxViews: 1,
            expiresAt: '2025-05-04T12:34:56.789Z',
            hasPassword: true,
            blockScreenshot: true,
            regionLock: null,
            deviceLock: false,
            camouflage: null
          },
          createdAt: '2025-05-03T12:34:56.789Z',
          creditsCost: 5
        }
      }
    });
    
    render(<CreateLink />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Content Type/i), { target: { value: 'file' } });
    
    // Mock file input
    const file = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/File/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    fireEvent.change(screen.getByLabelText(/Max Views/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Expires In/i), { target: { value: '86400' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByLabelText(/Block Screenshot/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
    
    // Check for success message
    expect(await screen.findByText(/Link created successfully/i)).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    // Setup API mock to return error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Not enough credits to create this link'
          }
        }
      }
    });
    
    render(<CreateLink />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Content Type/i), { target: { value: 'text' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a secret message' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
    
    // Check for error message
    expect(await screen.findByText(/Not enough credits to create this link/i)).toBeInTheDocument();
  });

  it('handles validation errors', async () => {
    render(<CreateLink />);
    
    // Submit the form without filling it out
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    // Check for validation error
    expect(await screen.findByText(/Content is required/i)).toBeInTheDocument();
  });

  it('displays credit cost estimate', async () => {
    render(<CreateLink />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Content Type/i), { target: { value: 'text' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a secret message' } });
    fireEvent.click(screen.getByLabelText(/Block Screenshot/i));
    
    // Check for credit cost estimate
    expect(screen.getByText(/Estimated cost: 3 credits/i)).toBeInTheDocument();
  });
});
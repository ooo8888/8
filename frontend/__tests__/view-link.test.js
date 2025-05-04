import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewLink from '../src/app/v/[id]/page';
import { api } from '../src/lib/api';

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
  }),
  useParams: () => ({
    id: 'abcdef123456'
  })
}));

// Mock the browser fingerprint
jest.mock('../src/lib/fingerprint', () => ({
  getDeviceFingerprint: jest.fn().mockResolvedValue('device-fingerprint-123')
}));

describe('View Link Page', () => {
  beforeEach(() => {
    // Reset API mock
    api.post.mockReset();
  });

  it('renders the view link page with password form', async () => {
    // Setup API mock to return password required
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message: 'This link is password protected'
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Check for password form
    await waitFor(() => {
      expect(screen.getByText(/This link is password protected/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unlock/i })).toBeInTheDocument();
  });

  it('handles password submission', async () => {
    // Setup API mock to return password required first, then success
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message: 'This link is password protected'
          }
        }
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        content: {
          type: 'text',
          data: 'This is a secret message',
          metadata: {
            createdAt: '2025-05-03T12:34:56.789Z',
            expiresAt: '2025-05-04T12:34:56.789Z',
            remainingViews: 0
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for password form
    await waitFor(() => {
      expect(screen.getByText(/This link is password protected/i)).toBeInTheDocument();
    });
    
    // Enter password and submit
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));
    
    // Wait for content to load
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/link/abcdef123456/view', {
        password: 'secret123',
        deviceId: 'device-fingerprint-123'
      });
    });
    
    // Check for content display
    expect(await screen.findByText(/This is a secret message/i)).toBeInTheDocument();
  });

  it('displays text content', async () => {
    // Setup API mock to return text content
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        content: {
          type: 'text',
          data: 'This is a secret message',
          metadata: {
            createdAt: '2025-05-03T12:34:56.789Z',
            expiresAt: '2025-05-04T12:34:56.789Z',
            remainingViews: 0
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/link/abcdef123456/view', {
        password: '',
        deviceId: 'device-fingerprint-123'
      });
    });
    
    // Check for content display
    expect(await screen.findByText(/This is a secret message/i)).toBeInTheDocument();
    
    // Check for metadata display
    expect(screen.getByText(/This link has self-destructed/i)).toBeInTheDocument();
    expect(screen.getByText(/Created: May 3, 2025/i)).toBeInTheDocument();
  });

  it('displays file content', async () => {
    // Setup API mock to return file content
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        content: {
          type: 'file',
          data: {
            url: 'data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp...',
            filename: 'document.pdf',
            mimeType: 'application/pdf',
            size: 12345
          },
          metadata: {
            createdAt: '2025-05-03T12:34:56.789Z',
            expiresAt: '2025-05-04T12:34:56.789Z',
            remainingViews: 0
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/link/abcdef123456/view', {
        password: '',
        deviceId: 'device-fingerprint-123'
      });
    });
    
    // Check for file display
    expect(await screen.findByText(/document.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/12.1 KB/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
    
    // Check for metadata display
    expect(screen.getByText(/This link has self-destructed/i)).toBeInTheDocument();
  });

  it('handles expired links', async () => {
    // Setup API mock to return link expired error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'LINK_EXPIRED',
            message: 'This link has expired'
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/This link has expired/i)).toBeInTheDocument();
    });
    
    // Check for error details
    expect(screen.getByText(/The link you're trying to access is no longer available/i)).toBeInTheDocument();
  });

  it('handles consumed links', async () => {
    // Setup API mock to return link consumed error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'LINK_CONSUMED',
            message: 'This link has reached its maximum view count'
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/This link has reached its maximum view count/i)).toBeInTheDocument();
    });
    
    // Check for error details
    expect(screen.getByText(/The link you're trying to access is no longer available/i)).toBeInTheDocument();
  });

  it('handles region blocked links', async () => {
    // Setup API mock to return region blocked error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'REGION_BLOCKED',
            message: 'This link is not accessible from your region'
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/This link is not accessible from your region/i)).toBeInTheDocument();
    });
    
    // Check for error details
    expect(screen.getByText(/The link creator has restricted access to specific regions/i)).toBeInTheDocument();
  });

  it('handles device mismatch links', async () => {
    // Setup API mock to return device mismatch error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'DEVICE_MISMATCH',
            message: 'This link is not accessible from this device'
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/This link is not accessible from this device/i)).toBeInTheDocument();
    });
    
    // Check for error details
    expect(screen.getByText(/The link creator has restricted access to specific devices/i)).toBeInTheDocument();
  });

  it('handles invalid password', async () => {
    // Setup API mock to return password required first, then invalid password
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message: 'This link is password protected'
          }
        }
      }
    }).mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'The password you entered is incorrect'
          }
        }
      }
    });
    
    render(<ViewLink />);
    
    // Wait for password form
    await waitFor(() => {
      expect(screen.getByText(/This link is password protected/i)).toBeInTheDocument();
    });
    
    // Enter password and submit
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong-password' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/The password you entered is incorrect/i)).toBeInTheDocument();
    });
  });
});
import axios from 'axios';
import { api } from '../src/lib/api';

// Mock axios
jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock location.href
    delete window.location;
    window.location = { href: '' };
  });

  it('adds authorization header when token exists', async () => {
    // Setup localStorage mock to return a token
    window.localStorage.getItem.mockReturnValueOnce('test-token');
    
    // Setup axios mock to return success
    axios.create.mockReturnValueOnce({
      request: {
        headers: {}
      },
      interceptors: {
        request: {
          use: (callback) => {
            const config = { headers: {} };
            callback(config);
            expect(config.headers.Authorization).toBe('Bearer test-token');
          }
        },
        response: {
          use: jest.fn()
        }
      }
    });
    
    // Re-import the API to trigger the interceptor setup
    jest.isolateModules(() => {
      require('../src/lib/api');
    });
    
    // Verify localStorage was called
    expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('redirects to login on 401 response', async () => {
    // Setup axios mock
    const mockAxios = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    };
    
    axios.create.mockReturnValueOnce(mockAxios);
    
    // Re-import the API to trigger the interceptor setup
    jest.isolateModules(() => {
      require('../src/lib/api');
    });
    
    // Get the response error handler
    const responseErrorHandler = mockAxios.interceptors.response.use.mock.calls[0][1];
    
    // Create a mock 401 error
    const error = {
      response: {
        status: 401
      }
    };
    
    // Call the error handler
    try {
      await responseErrorHandler(error);
    } catch (e) {
      // Expected to throw
    }
    
    // Verify localStorage token was removed
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    
    // Verify redirect to login
    expect(window.location.href).toBe('/login');
  });

  it('passes through non-401 errors', async () => {
    // Setup axios mock
    const mockAxios = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    };
    
    axios.create.mockReturnValueOnce(mockAxios);
    
    // Re-import the API to trigger the interceptor setup
    jest.isolateModules(() => {
      require('../src/lib/api');
    });
    
    // Get the response error handler
    const responseErrorHandler = mockAxios.interceptors.response.use.mock.calls[0][1];
    
    // Create a mock 404 error
    const error = {
      response: {
        status: 404
      }
    };
    
    // Call the error handler and expect it to reject with the original error
    await expect(responseErrorHandler(error)).rejects.toEqual(error);
    
    // Verify localStorage token was not removed
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    
    // Verify no redirect
    expect(window.location.href).toBe('');
  });

  it('handles network errors', async () => {
    // Setup axios mock
    const mockAxios = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    };
    
    axios.create.mockReturnValueOnce(mockAxios);
    
    // Re-import the API to trigger the interceptor setup
    jest.isolateModules(() => {
      require('../src/lib/api');
    });
    
    // Get the response error handler
    const responseErrorHandler = mockAxios.interceptors.response.use.mock.calls[0][1];
    
    // Create a mock network error (no response property)
    const error = new Error('Network Error');
    
    // Call the error handler and expect it to reject with the original error
    await expect(responseErrorHandler(error)).rejects.toEqual(error);
    
    // Verify localStorage token was not removed
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    
    // Verify no redirect
    expect(window.location.href).toBe('');
  });
});
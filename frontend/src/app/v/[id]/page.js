'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as api from '../../../lib/api';

export default function ViewLink({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [isLastView, setIsLastView] = useState(false);
  const [screenshotBlocked, setScreenshotBlocked] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  // Detect screenshot attempts
  useEffect(() => {
    if (screenshotBlocked) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          setDestroyed(true);
          setContent(null);
          setError('Link destroyed: Screenshot attempt detected');
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Detect print attempts
      window.addEventListener('beforeprint', () => {
        setDestroyed(true);
        setContent(null);
        setError('Link destroyed: Print attempt detected');
      });
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeprint', () => {});
      };
    }
  }, [screenshotBlocked]);

  // Load link content
  const loadLink = async (pwd = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.viewLink(id, pwd);
      
      if (data.requiresPassword) {
        setRequiresPassword(true);
        setIsLoading(false);
        return;
      }
      
      setContent(data.content);
      setContentType(data.type);
      setIsLastView(data.isLastView);
      setScreenshotBlocked(data.screenshotBlock);
      setRequiresPassword(false);
    } catch (err) {
      console.error('Failed to load link:', err);
      setError(err.response?.data?.error || 'Failed to load link');
    } finally {
      setIsLoading(false);
    }
  };

  // Load link on initial render
  useEffect(() => {
    loadLink();
  }, [id]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    loadLink(password);
  };

  const renderContent = () => {
    if (!content) return null;
    
    if (contentType === 'text') {
      return (
        <div className="bg-primary-900 p-4 rounded-md whitespace-pre-wrap break-words">
          {content}
        </div>
      );
    } else if (contentType === 'file') {
      // Handle file content (base64)
      const fileData = content.split(',');
      const mimeType = fileData[0].match(/:(.*?);/)[1];
      
      if (mimeType.startsWith('image/')) {
        return <img src={content} alt="Shared image" className="max-w-full rounded-md" />;
      } else if (mimeType.startsWith('audio/')) {
        return (
          <audio controls className="w-full">
            <source src={content} type={mimeType} />
            Your browser does not support the audio element.
          </audio>
        );
      } else if (mimeType.startsWith('video/')) {
        return (
          <video controls className="w-full rounded-md">
            <source src={content} type={mimeType} />
            Your browser does not support the video element.
          </video>
        );
      } else {
        // For other file types, offer download
        const fileName = "download";
        return (
          <div className="text-center">
            <p className="mb-4">File ready for download</p>
            <a 
              href={content} 
              download={fileName}
              className="btn btn-primary"
            >
              Download File
            </a>
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="card max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">
            <span className="text-accent-400">EXITLINK</span> OMEGA
          </h1>
          <Link href="/" className="text-sm text-primary-400 hover:text-primary-300">
            Create your own
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-accent-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-primary-400">Loading secure content...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-red-400">Link Unavailable</h2>
            <p className="text-primary-400 mb-6">{error}</p>
            <Link href="/" className="btn btn-primary">
              Create Your Own Link
            </Link>
          </div>
        ) : requiresPassword ? (
          <div className="py-8">
            <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">Password Protected</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                className="input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary w-full">
                Unlock Content
              </button>
            </form>
          </div>
        ) : destroyed ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-red-400">Link Destroyed</h2>
            <p className="text-primary-400 mb-6">This link has self-destructed and the content is no longer available.</p>
            <Link href="/" className="btn btn-primary">
              Create Your Own Link
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {screenshotBlocked && (
              <div className="bg-yellow-900/30 border border-yellow-800/50 p-3 rounded-md text-sm text-yellow-200 mb-4">
                <strong>WARNING:</strong> Screenshot protection is enabled. Any attempt to capture this content will destroy the link.
              </div>
            )}
            
            <div className="space-y-4">
              {renderContent()}
            </div>
            
            {isLastView && (
              <div className="bg-red-900/30 border border-red-800/50 p-3 rounded-md text-sm text-red-200">
                This link has now self-destructed and cannot be viewed again.
              </div>
            )}
            
            <div className="text-center pt-4">
              <Link href="/" className="btn btn-primary">
                Create Your Own Link
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
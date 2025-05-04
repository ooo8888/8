'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../../store';

export default function CreateLink() {
  const router = useRouter();
  const { isAuthenticated, credits, createLink, isLoading, error } = useStore();
  
  const [linkType, setLinkType] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    maxViews: 1,
    timer: 0,
    password: '',
    regionLock: false,
    deviceLock: false,
    screenshotBlock: false,
    camouflage: false
  });
  const [creditCost, setCreditCost] = useState(1);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Calculate credit cost
  useEffect(() => {
    let cost = 1; // Base cost for text
    
    if (linkType === 'file' && file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        cost = 5; // Pro tier
      } else {
        cost = 3; // Standard tier
      }
    }
    
    // Add costs for options
    if (options.password) cost += 1;
    if (options.screenshotBlock) cost += 2;
    if (options.regionLock || options.deviceLock) cost += 2;
    if (options.camouflage) cost += 3;
    
    // Timer costs
    if (options.timer > 24 * 60 * 60 * 1000) { // > 24 hours
      const extraDays = Math.ceil((options.timer - 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000));
      cost += extraDays;
    }
    
    setCreditCost(cost);
  }, [linkType, file, options]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleOptionChange = (name, value) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleTimerChange = (value) => {
    let timerValue = 0;
    
    switch (value) {
      case '1h':
        timerValue = 60 * 60 * 1000; // 1 hour
        break;
      case '24h':
        timerValue = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case '3d':
        timerValue = 3 * 24 * 60 * 60 * 1000; // 3 days
        break;
      case '7d':
        timerValue = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      default:
        timerValue = 0; // No timer
    }
    
    handleOptionChange('timer', timerValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (creditCost > credits) {
      alert('Insufficient credits. Please purchase more credits.');
      return;
    }
    
    try {
      let contentToSend = content;
      
      if (linkType === 'file' && file) {
        // Convert file to base64
        const reader = new FileReader();
        contentToSend = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }
      
      const result = await createLink(contentToSend, linkType, options);
      setCreatedLink(result);
    } catch (err) {
      console.error('Failed to create link:', err);
    }
  };

  const handleCopyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    setCreatedLink(null);
    setContent('');
    setFile(null);
    setOptions({
      maxViews: 1,
      timer: 0,
      password: '',
      regionLock: false,
      deviceLock: false,
      screenshotBlock: false,
      camouflage: false
    });
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-primary-800 border-b border-primary-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold">
              <span className="text-accent-400">EXITLINK</span> OMEGA
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-primary-900 px-3 py-1 rounded-full flex items-center space-x-2">
              <span className="text-accent-400 font-semibold">{credits}</span>
              <span className="text-primary-400 text-xs">credits</span>
            </div>
            
            <Link href="/dashboard" className="btn btn-secondary text-sm py-1">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto p-4 flex-1">
        <div className="max-w-2xl mx-auto">
          {!createdLink ? (
            <>
              <h1 className="text-2xl font-bold mb-6">Create Self-Destructing Link</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Link Type */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Content Type</h2>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className={`btn ${linkType === 'text' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setLinkType('text')}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      className={`btn ${linkType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setLinkType('file')}
                    >
                      File
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Content</h2>
                  
                  {linkType === 'text' ? (
                    <textarea
                      className="input"
                      placeholder="Enter your secret text here..."
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="file"
                        id="file"
                        className="hidden"
                        onChange={handleFileChange}
                        required
                      />
                      <label
                        htmlFor="file"
                        className="block w-full p-4 border-2 border-dashed border-primary-600 rounded-md text-center cursor-pointer hover:border-accent-500 transition-colors"
                      >
                        {file ? (
                          <div className="text-accent-400">
                            <div className="font-semibold">{file.name}</div>
                            <div className="text-xs text-primary-400">
                              {(file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        ) : (
                          <div className="text-primary-400">
                            Click to select a file
                            <div className="text-xs">
                              Max size: 25MB (Pro), 5MB (Standard)
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Self-Destruct Options */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Self-Destruct Options</h2>
                  
                  <div className="space-y-4">
                    {/* View Count */}
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-2">
                        Maximum Views
                      </label>
                      <select
                        className="input"
                        value={options.maxViews}
                        onChange={(e) => handleOptionChange('maxViews', parseInt(e.target.value))}
                      >
                        <option value={1}>1 view (default)</option>
                        <option value={2}>2 views</option>
                        <option value={3}>3 views</option>
                        <option value={5}>5 views</option>
                        <option value={10}>10 views</option>
                      </select>
                    </div>
                    
                    {/* Timer */}
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-2">
                        Expiration Timer
                      </label>
                      <select
                        className="input"
                        value={
                          options.timer === 0 ? 'none' :
                          options.timer === 60 * 60 * 1000 ? '1h' :
                          options.timer === 24 * 60 * 60 * 1000 ? '24h' :
                          options.timer === 3 * 24 * 60 * 60 * 1000 ? '3d' :
                          options.timer === 7 * 24 * 60 * 60 * 1000 ? '7d' : 'none'
                        }
                        onChange={(e) => handleTimerChange(e.target.value)}
                      >
                        <option value="none">No expiration</option>
                        <option value="1h">1 hour</option>
                        <option value="24h">24 hours</option>
                        <option value="3d">3 days (+2 credits)</option>
                        <option value="7d">7 days (+6 credits)</option>
                      </select>
                    </div>
                    
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-primary-300 mb-2">
                        Password Protection (+1 credit)
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Leave empty for no password"
                        value={options.password}
                        onChange={(e) => handleOptionChange('password', e.target.value)}
                      />
                    </div>
                    
                    {/* Advanced Options */}
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-primary-300 mb-3">
                        Advanced Options
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="screenshot-block"
                            checked={options.screenshotBlock}
                            onChange={(e) => handleOptionChange('screenshotBlock', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="screenshot-block" className="text-sm text-primary-300">
                            Screenshot Block (+2 credits)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="region-lock"
                            checked={options.regionLock}
                            onChange={(e) => handleOptionChange('regionLock', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="region-lock" className="text-sm text-primary-300">
                            Region Lock (+2 credits)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="device-lock"
                            checked={options.deviceLock}
                            onChange={(e) => handleOptionChange('deviceLock', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="device-lock" className="text-sm text-primary-300">
                            Device Lock (+2 credits)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="camouflage"
                            checked={options.camouflage}
                            onChange={(e) => handleOptionChange('camouflage', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="camouflage" className="text-sm text-primary-300">
                            Camouflage Link (+3 credits)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Credit Cost */}
                <div className="card bg-primary-900">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">Total Cost</h2>
                      <p className="text-sm text-primary-400">
                        Your current balance: <span className="text-accent-400">{credits} credits</span>
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-accent-400">
                      {creditCost} <span className="text-sm text-primary-400">credits</span>
                    </div>
                  </div>
                  
                  {creditCost > credits && (
                    <div className="mt-4 bg-red-900/30 border border-red-800/50 p-3 rounded-md text-sm text-red-200">
                      Insufficient credits. Please purchase more credits to create this link.
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-full py-3"
                  disabled={isLoading || creditCost > credits || (linkType === 'text' && !content) || (linkType === 'file' && !file)}
                >
                  {isLoading ? 'Creating...' : 'Create Self-Destructing Link'}
                </button>
                
                {error && (
                  <div className="bg-red-900/50 border border-red-800 p-3 rounded-md text-sm text-red-200">
                    {error}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="card text-center py-8">
              <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Link Created!</h2>
              <p className="text-primary-400 mb-6">
                Your self-destructing link is ready to share.
              </p>
              
              <div className="bg-primary-900 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-primary-300">Your Link</h3>
                  <button 
                    className="text-xs text-accent-400 hover:text-accent-300"
                    onClick={handleCopyLink}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-sm break-all bg-primary-800 p-3 rounded border border-primary-700">
                  {createdLink.url}
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateAnother}
                >
                  Create Another Link
                </button>
                <Link href="/dashboard" className="btn btn-secondary">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
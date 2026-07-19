import React, { Component } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured Frontend Crash:', error, errorInfo);
    
    // Post diagnostics parameters to the Express log endpoint
    axios.post('/api/v1/log/frontend', {
      errorMsg: error?.toString() || 'React Render Crash',
      componentStack: errorInfo?.componentStack || '',
      locationUrl: window.location.href
    }).catch(err => {
      // Ignore fallback failures
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#080d0a]">
          <div className="max-w-md w-full p-8 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-3xl shadow-sm text-center space-y-5">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-base font-black dark:text-white">Interface Error Detected</h1>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                An unexpected rendering problem has crashed the application layout. The error diagnostics have been submitted to server administrators.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <FaRedo /> Reload Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

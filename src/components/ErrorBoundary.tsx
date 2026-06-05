'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.group('🚨 ErrorBoundary 捕获到错误');
    console.error('❌ Error:', error);
    console.error('📛 Error name:', error.name);
    console.error('📝 Error message:', error.message);
    console.error('📚 Error stack:', error.stack);
    console.error('🔍 Error info:', errorInfo);
    console.error('📄 Component stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <div className="text-center text-white p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-slate-300 mb-6">
              {this.state.error?.message || 'Please refresh the page or try again later.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
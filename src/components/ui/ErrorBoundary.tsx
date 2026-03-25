'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches rendering errors in child components and shows a graceful fallback
 * instead of a white screen. Provides a "Try again" button to recover.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="w-full h-screen flex flex-col items-center justify-center px-6"
          style={{ backgroundColor: '#FFE3D5' }}
        >
          <p
            className="text-xl font-bold mb-2"
            style={{ color: '#313E88' }}
          >
            Something went wrong
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: '#313E88', opacity: 0.6 }}
          >
            The tide will return shortly
          </p>
          <button
            className="px-6 py-3 rounded-full font-semibold text-sm cursor-pointer min-h-[44px]"
            style={{ backgroundColor: '#E49C75', color: '#292E64' }}
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

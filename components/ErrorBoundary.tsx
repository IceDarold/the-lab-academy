import React, { Component, ErrorInfo, ReactNode } from 'react';

// Simple logger function - in a real app, this could be replaced with a proper logging service
const logError = (error: Error, errorInfo: ErrorInfo) => {
  // Send to logging service or analytics
  // For now, we'll use a placeholder - replace with actual logging implementation
  console.error('ErrorBoundary caught an error:', error, errorInfo); // Temporary for development
};

class SafeFallback extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return this.props.defaultFallback;
    }
    return this.props.children;
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
  hasRetried: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  fallbackFailed: boolean;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0, hasRetried: false };
    this.fallbackFailed = false;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    return { hasError: true, error: normalizedError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.hasRetried && prevProps.children !== this.props.children) {
      this.setState({ hasRetried: false });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      retryCount: this.state.retryCount + 1,
      hasRetried: true
    });
    this.fallbackFailed = false;
  };

  render() {
    if (this.state.hasRetried) {
      return null;
    }
    const defaultFallback = (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8"
      >
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label="Try Again"
          >
            Try Again
          </button>
        </div>
      </div>
    );

    if (this.state.hasError) {
      if (this.props.fallback && !this.fallbackFailed) {
        return <SafeFallback onError={() => this.fallbackFailed = true} defaultFallback={defaultFallback}>{this.props.fallback}</SafeFallback>;
      }

      return defaultFallback;
    }

    return <div key={this.state.retryCount}>{this.props.children}</div>;
  }
}

export default ErrorBoundary;
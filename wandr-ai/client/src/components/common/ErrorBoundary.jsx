import React from 'react';
import * as Sentry from '@sentry/react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-4 py-16">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-black text-red-600">
          !
        </div>
        <h1 className="text-3xl font-black text-slate-900">Something broke</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The app hit an unexpected error. You can try again or go back home.
        </p>
        {error?.message && (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-left text-xs leading-6 text-slate-500">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="flex-1" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Link to="/" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled runtime error', error, errorInfo);
    if (typeof Sentry.captureException === 'function') {
      Sentry.captureException(error, { extra: errorInfo });
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

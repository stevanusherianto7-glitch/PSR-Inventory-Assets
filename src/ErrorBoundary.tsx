import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] overflow-auto p-6 bg-red-50 text-red-800 font-sans">
          <h2 className="text-2xl font-bold mb-4">Component Crash!</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-white/50 p-4 rounded-lg">{this.state.error?.stack || this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

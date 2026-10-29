import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-xl p-8 shadow-2xl text-center">
            <h2 className="font-serif-noir text-2xl text-red-400 mb-3 tracking-wide">
              An Unexpected Glitch Occurred
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The detective agency encountered an unanticipated problem with the scene. You can reload the page or return to the precinct.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Reload Scene
              </button>
              <button
                onClick={this.handleHome}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
              >
                Return to Precinct
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

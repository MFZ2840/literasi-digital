// components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // getDerivedStateFromError dipanggil setelah error dilemparkan oleh komponen turunan.
  // Ini mengembalikan nilai untuk memperbarui state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Perbarui state agar render fallback UI berikutnya
    return { hasError: true, error };
  }

  // componentDidCatch dipanggil setelah error dilemparkan oleh komponen turunan.
  // Ini adalah tempat yang baik untuk log informasi error.
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    // Anda bisa mengirim error ke layanan logging eksternal di sini
  }

  // Fungsi untuk mereset state error, memungkinkan komponen untuk mencoba render lagi
  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Jika ada fallback component yang disediakan, render itu
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      // Jika tidak ada fallback component, render UI default ini
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              An error occurred while loading this page.
            </p>
            <button
              onClick={this.resetError}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Jika tidak ada error, render children seperti biasa
    return this.props.children;
  }
}

export default ErrorBoundary;

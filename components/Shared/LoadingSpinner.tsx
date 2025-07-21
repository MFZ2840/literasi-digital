// components/shared/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-6 my-4">
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      <p className="ml-3 text-gray-600">Memuat...</p>
    </div>
  );
};

export default LoadingSpinner;
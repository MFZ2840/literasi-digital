// components/Article/PaginationControls.tsx
import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  isVisible: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  isVisible,
}) => {
  if (!isVisible || totalPages <= 1) { // Jangan render jika tidak terlihat atau hanya 1 halaman
    return null;
  }

  return (
    <div className="flex justify-center items-center space-x-3">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={`
          group relative p-2.5 rounded-full shadow-md transition-all duration-300 
          ${currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }
        `}
        aria-label="Previous Page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        
        {/* Hover effect for enabled button */}
        {currentPage > 1 && (
          <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </button>

      {/* Page indicator with glassmorphism effect */}
      <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/20">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Halaman{' '}
          <span className="font-bold text-blue-600">{currentPage}</span>
          {' '}dari{' '}
          <span className="font-bold text-indigo-600">{totalPages}</span>
        </span>
      </div>

      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={`
          group relative p-2.5 rounded-full shadow-md transition-all duration-300 
          ${currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }
        `}
        aria-label="Next Page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        
        {/* Hover effect for enabled button */}
        {currentPage < totalPages && (
          <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </button>
    </div>
  );
};

export default PaginationControls;
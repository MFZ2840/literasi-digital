// components/Article/LoadMoreButton.tsx
import React from 'react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) {
    return null; // Jangan render tombol jika tidak terlihat
  }

  return (
    <div className="text-center">
      <button
        onClick={onClick}
        className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center space-x-2">
          <span className="text-sm sm:text-base whitespace-nowrap">
            Tampilkan Lebih Banyak
          </span>
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </button>
    </div>
  );
};

export default LoadMoreButton;
// components/shared/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md my-4 mx-auto max-w-md">
      <svg
        className="w-8 h-8 text-red-500 mb-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <p className="font-semibold text-lg mb-1">Terjadi Kesalahan!</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default ErrorMessage;
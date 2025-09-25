import React from 'react';

interface SpinnerProps {
  message?: string;
}

export const Spinner = ({ message = "載入中..." }: SpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4" role="status">
        <span className="sr-only">載入中...</span>
      </div>
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
};

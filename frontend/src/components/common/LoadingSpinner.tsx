// src/components/common/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({size = 'md' }) => {
  // map size prop to actual size values
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const spinnerSize = sizeMap[size];

  return (
    <div className="flex justify-center items-center">
        <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-gray-900`}></div>
    </div>
  );
};

export default LoadingSpinner;

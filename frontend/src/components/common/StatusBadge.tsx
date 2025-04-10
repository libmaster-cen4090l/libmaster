// src/components/common/StatusBadge.tsx
import React from 'react';

export type StatusType = 'available' | 'maintenance' | 'closed' | 'pending' | 'confirmed' | 'cancelled';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // define styling based on status
  const getStatusStyles = (): string => {
    switch (status) {
      case 'available':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
        className={`text-xs font-medium px-2 py-1 shadow rounded-full ${getStatusStyles()} ${className}`}
    >
        {status}
    </span>
  );
};

export default StatusBadge;

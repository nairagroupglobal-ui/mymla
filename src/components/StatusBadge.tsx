// src/components/StatusBadge.tsx
import React from 'react';
import { statusColors } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorClass} ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

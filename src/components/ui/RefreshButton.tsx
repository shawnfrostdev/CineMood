'use client';

import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
  return (
    <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40">
      <button 
        onClick={onClick}
        disabled={isLoading}
        className="bg-[#436029] hover:bg-[#516F39] text-[#F0EDD1] rounded-l-md p-3 flex items-center justify-center transition-colors shadow-md disabled:opacity-50"
        aria-label="Refresh content"
      >
        <RefreshCw 
          size={18} 
          className={isLoading ? 'animate-spin' : ''} 
        />
      </button>
    </div>
  );
} 
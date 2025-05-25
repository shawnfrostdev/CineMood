'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface CollapsibleSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
}

export default function CollapsibleSearch({
  placeholder = 'Search...',
  onSearch,
  onClear,
}: CollapsibleSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Handle search on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // Handle search button click
  const handleSearchClick = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };
  
  // Handle clear button click
  const handleClearClick = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <>
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 translate-y-16">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#436029] hover:bg-[#516F39] text-[#F0EDD1] rounded-l-md p-3 flex items-center justify-center transition-colors shadow-md"
          aria-label="Open search"
        >
          <Search size={18} />
        </button>
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0C100E] rounded-lg shadow-lg w-full max-w-md border border-[#436029] p-4 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#F0EDD1] font-medium">Search</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#F0EDD1] hover:text-white"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full bg-transparent outline-none text-[#F0EDD1] placeholder:text-[#436029] text-sm border border-[#436029] rounded-md p-2 pr-8"
                />
                {query && (
                  <button 
                    onClick={handleClearClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#436029] hover:text-[#F0EDD1] transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button 
                onClick={handleSearchClick}
                className="px-4 py-2 bg-[#436029] text-[#F0EDD1] hover:bg-[#516F39] transition-colors rounded-md flex items-center"
                disabled={!query.trim()}
              >
                <Search size={16} className="mr-2" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
} 
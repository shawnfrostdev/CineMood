'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  onClear,
  className = '',
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle search on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
    }
  };
  
  // Handle search button click
  const handleSearchClick = () => {
    if (query.trim()) {
      onSearch(query.trim());
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
    <div 
      className={`relative flex items-center ${className}`}
    >
      <div className={`
        flex items-center w-full rounded-md border 
        ${isFocused ? 'border-[#436029]' : 'border-[#436029]/30'} 
        bg-[#0C100E] overflow-hidden transition-all
      `}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2 px-3 outline-none text-[#F0EDD1] placeholder:text-[#436029]"
        />
        
        {query ? (
          <button 
            onClick={handleClearClick}
            className="p-2 text-[#436029] hover:text-[#F0EDD1] transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        ) : null}
        
        <button 
          onClick={handleSearchClick}
          className="p-2 bg-[#436029] text-[#F0EDD1] hover:bg-[#516F39] transition-colors"
          aria-label="Search"
          disabled={!query.trim()}
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
} 
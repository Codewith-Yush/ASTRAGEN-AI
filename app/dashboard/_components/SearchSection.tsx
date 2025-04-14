import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

function SearchSection({ onSearchInput }: { onSearchInput: (value: string) => void }) {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    onSearchInput(value);
  };

  return (
    <div className="p-8 max-w-xl mx-auto relative">
      {/* Subtle radial gradient background */}
      <div
        className={`
          absolute inset-0 -z-10 bg-gradient-to-br from-gray-100 to-gray-200 
          dark:from-gray-800 dark:to-gray-900 opacity-50 transition-all duration-500
          ${isFocused ? 'scale-105' : 'scale-100'}
        `}
      />

      {/* Search container */}
      <div
        className={`
          relative flex items-center bg-white dark:bg-gray-800 
          border-2 rounded-xl transition-all duration-300 ease-in-out
          ${isFocused 
            ? 'border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.4)] scale-102' 
            : 'border-gray-200 dark:border-gray-600 hover:scale-101 hover:shadow-[0_0_10px_rgba(45,212,191,0.2)]'
          }
        `}
      >
        <Search
          className={`
            w-5 h-5 ml-4 text-gray-400 transition-transform duration-200
            ${isFocused ? 'text-teal-500 scale-110 rotate-6' : 'dark:text-gray-300 hover:scale-105'}
          `}
        />

        <input
          type="text"
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search..."
          className="
            flex-1 p-3.5 bg-transparent border-0 
            text-gray-900 dark:text-gray-100 
            placeholder-teal-400/70 dark:placeholder-teal-400/50 
            focus:outline-none text-base font-medium tracking-tight
          "
        />

        {searchText.length > 0 && (
          <button
            onClick={() => handleSearchChange('')}
            className="
              mr-4 p-1.5 rounded-full relative overflow-hidden
              text-gray-400 hover:text-teal-500 dark:text-gray-300 dark:hover:text-teal-400
              transition-all duration-200 hover:scale-110
            "
          >
            <span
              className="
                absolute inset-0 bg-teal-500/20 scale-0 rounded-full
                group-hover:scale-100 transition-transform duration-300 origin-center
              "
            />
            <X size={16} className="relative" />
          </button>
        )}
      </div>

      {/* Pulse effect on focus */}
      {isFocused && (
        <div
          className="
            absolute inset-0 rounded-xl border border-teal-500/30 
            pulse-effect opacity-0 pointer-events-none
          "
        />
      )}
    </div>
  );
}

export default SearchSection;
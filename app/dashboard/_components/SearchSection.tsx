import React, { useState, useEffect } from 'react';
import { Search, XCircle, Cpu, Code, PenTool, BarChart } from 'lucide-react';

function SearchSection({ onSearchInput }) {
  const [searchText, setSearchText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);

  // Handle search with a simulated AI processing delay
  const handleSearchChange = (value) => {
    setSearchText(value);
    onSearchInput(value);
    
    if (value.length > 0) {
      setIsSearching(true);
      // Simulate AI processing time
      setTimeout(() => {
        setIsSearching(false);
        setResultsCount(Math.floor(Math.random() * 30) + 5);
      }, 600);
    } else {
      setIsSearching(false);
      setResultsCount(0);
    }
  };

  return (
    <div className="relative p-6 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Subtle tech pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="tech-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1" height="1" fill="currentColor" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#tech-pattern)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header with subtle indicator animation */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-6 w-1 bg-blue-500 rounded-full opacity-75"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">AI Content Explorer</h2>
            <div className="h-6 w-1 bg-blue-500 rounded-full opacity-75"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Advanced search through AI-generated content
          </p>
        </div>
        
        {/* Search box with professional styling */}
        <div className="max-w-2xl mx-auto relative">
          <div 
            className={`
              flex items-center overflow-hidden bg-white dark:bg-gray-800 rounded-lg
              transition-all duration-300 ease-out
              ${isActive ? 'shadow-md ring-1 ring-blue-400 dark:ring-blue-500' : 'shadow border border-gray-200 dark:border-gray-700'}
            `}
          >
            {/* Subtle side indicator */}
            <div className={`
              w-1 h-full transition-all duration-300
              ${isSearching ? 'bg-gradient-to-b from-blue-400 to-indigo-600 animate-pulse' : 
                searchText.length > 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}
            `}></div>
            
            <div className="flex-1 flex items-center px-4 py-3 md:py-4">
              <Search className={`w-5 h-5 mr-3 transition-colors duration-300 
                ${isActive ? 'text-blue-500' : 'text-gray-400'}
                ${isSearching ? 'animate-pulse' : ''}`} 
              />
              
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
                placeholder="Search AI content, templates, or topics..."
                className="flex-1 bg-transparent border-0 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm md:text-base"
              />
              
              {isSearching && (
                <div className="mr-3">
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              {searchText.length > 0 && !isSearching && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>
          
          {/* Professional category pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 md:mt-6">
            {[
              { name: 'AI Writing', icon: <PenTool size={16} /> },
              { name: 'Code Gen', icon: <Code size={16} /> },
              { name: 'Data Analysis', icon: <BarChart size={16} /> },
              { name: 'ML Models', icon: <Cpu size={16} /> }
            ].map((category, index) => (
              <div
                key={index}
                className="px-4 py-2 md:py-3 rounded-lg cursor-pointer transition-all duration-200 ease-out bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                onClick={() => {
                  handleSearchChange(category.name);
                  setIsActive(true);
                }}
              >
                <span className="text-blue-500">{category.icon}</span>
                <span className="text-gray-700 dark:text-gray-200 text-sm">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Status indicator with clean animation */}
        {searchText.length > 0 && !isSearching && (
          <div 
            className="mt-5 md:mt-6 mx-auto max-w-xs text-center transition-all duration-300 transform text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md py-2 px-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center gap-2 opacity-0 animate-fade-in"
            style={{ animation: 'fadeIn 0.3s forwards' }}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{resultsCount} results found for "{searchText}"</span>
          </div>
        )}
        
        {/* AI processing indicator */}
        {isSearching && (
          <div className="mt-5 md:mt-6 mx-auto max-w-xs text-center transition-all duration-300 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md py-2 px-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center gap-2">
            <span className="text-blue-500 animate-pulse">Processing query with AI...</span>
          </div>
        )}
      </div>
      
      {/* Add keyframe animations via style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s forwards;
        }
      `}</style>
    </div>
  );
}

export default SearchSection;
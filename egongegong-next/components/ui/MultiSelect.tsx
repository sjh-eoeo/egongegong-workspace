'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

interface MultiSelectProps {
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder = 'Select...', 
  className = '' 
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionName: string) => {
    if (selected.includes(optionName)) {
      onChange(selected.filter(s => s !== optionName));
    } else {
      onChange([...selected, optionName]);
    }
  };

  const removeOption = (optionName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== optionName));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Display selected tags or placeholder */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="min-h-[28px] px-2 py-1 flex items-center gap-1 flex-wrap cursor-pointer bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-xs text-gray-400 dark:text-gray-500">{placeholder}</span>
        ) : (
          selected.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium"
            >
              {name}
              <X
                size={10}
                className="cursor-pointer hover:text-red-500 transition-colors"
                onClick={(e) => removeOption(name, e)}
              />
            </span>
          ))
        )}
        <ChevronDown 
          size={12} 
          className={`ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">No options</div>
          ) : (
            options.map(option => {
              const isSelected = selected.includes(option.name);
              return (
                <div
                  key={option.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.name);
                  }}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                    isSelected 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${
                    isSelected 
                      ? 'bg-gray-900 dark:bg-gray-600 border-gray-900 dark:border-gray-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  {option.name}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

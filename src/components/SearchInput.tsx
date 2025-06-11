import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showClearButton?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = '검색...',
  debounceMs = 300,
  isLoading = false,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  showClearButton = true,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [internalValue, onChange, debounceMs, value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  // Handle clear
  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'pl-8 pr-8 py-1.5 text-sm',
    md: 'pl-10 pr-10 py-2 text-sm',
    lg: 'pl-12 pr-12 py-3 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconPositions = {
    sm: 'left-2',
    md: 'left-3',
    lg: 'left-4',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className={`absolute inset-y-0 ${iconPositions[size]} flex items-center pointer-events-none`}>
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
        ) : (
          <Search className={`${iconSizes[size]} text-gray-400`} />
        )}
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={`
          block w-full ${sizeClasses[size]} border border-gray-300 rounded-md 
          leading-5 bg-white placeholder-gray-500 
          focus:outline-none focus:placeholder-gray-400 focus:ring-1 
          focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        placeholder={placeholder}
      />

      {/* Clear Button */}
      {showClearButton && internalValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={`
            absolute inset-y-0 right-0 ${iconPositions[size]} flex items-center
            text-gray-400 hover:text-gray-600 focus:outline-none
            transition-colors duration-200
          `}
          title="검색어 지우기 (Esc)"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
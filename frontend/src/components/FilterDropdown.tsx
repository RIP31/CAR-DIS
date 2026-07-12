import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | { value: string; label: string }[];
  defaultLabel: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onChange,
  options,
  defaultLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { value, label } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const allOptions = [{ value: '', label: defaultLabel }, ...normalizedOptions];
  const selectedOption = allOptions.find((o) => o.value === value) || allOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(allOptions.findIndex((o) => o.value === value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % allOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + allOptions.length) % allOptions.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allOptions.length) {
          onChange(allOptions[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full text-left" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:border-blue-500/30 hover:text-slate-900 transition-all select-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-1.5 focus:outline-none animate-fade-in-up"
          role="listbox"
          tabIndex={-1}
        >
          {allOptions.map((option, idx) => {
            const isSelected = option.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600'
                    : isFocused
                    ? 'bg-slate-50 text-slate-950'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4 text-blue-600" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;

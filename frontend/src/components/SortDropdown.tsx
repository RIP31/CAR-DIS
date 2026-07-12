import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  { value: 'latest', label: 'Latest Added' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest Model Year' },
  { value: 'oldest', label: 'Oldest Model Year' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

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
        setFocusedIndex(OPTIONS.findIndex((o) => o.value === value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % OPTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + OPTIONS.length) % OPTIONS.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < OPTIONS.length) {
          onChange(OPTIONS[focusedIndex].value);
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
    <div className="relative inline-block text-left" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-500/30 hover:text-slate-900 transition-all select-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="truncate min-w-[130px] text-left">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2 focus:outline-none animate-fade-in-up"
          role="listbox"
          tabIndex={-1}
        >
          {OPTIONS.map((option, idx) => {
            const isSelected = option.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${
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

export default SortDropdown;

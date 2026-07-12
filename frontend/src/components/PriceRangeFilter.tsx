import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface PriceRangeFilterProps {
  minPrice: string;
  maxPrice: string;
  setMinPrice: (val: string) => void;
  setMaxPrice: (val: string) => void;
}

const PRESETS = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under $30k', min: '', max: '30000' },
  { label: '$30k – $75k', min: '30000', max: '75000' },
  { label: '$75k – $150k', min: '75000', max: '150000' },
  { label: '$150k+', min: '150000', max: '' },
];

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const MAX_LIMIT = 250000;

  const currentMin = minPrice === '' ? 0 : Number(minPrice);
  const currentMax = maxPrice === '' ? MAX_LIMIT : Number(maxPrice);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), currentMax - 5000);
    setMinPrice(val === 0 ? '' : val.toString());
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), currentMin + 5000);
    setMaxPrice(val === MAX_LIMIT ? '' : val.toString());
  };

  const getLabel = () => {
    if (!minPrice && !maxPrice) return 'Any Price';
    if (!minPrice) return `Under $${Number(maxPrice).toLocaleString()}`;
    if (!maxPrice) return `$${Number(minPrice).toLocaleString()}+`;
    return `$${Number(minPrice).toLocaleString()} - $${Number(maxPrice).toLocaleString()}`;
  };

  const leftPercent = (currentMin / MAX_LIMIT) * 100;
  const rightPercent = (currentMax / MAX_LIMIT) * 100;

  return (
    <div className="relative w-full select-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-sm font-semibold hover:border-blue-500/30 transition-all cursor-pointer text-left"
      >
        <span className="truncate">{getLabel()}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 space-y-5 animate-fade-in-up md:min-w-[280px]">
          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMinPrice(preset.min);
                      setMaxPrice(preset.max);
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-4 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drag to Adjust</span>
            <div className="relative h-6 flex items-center">
              {/* Slider Track background */}
              <div className="absolute left-0 right-0 h-1.5 bg-slate-100 rounded-lg pointer-events-none" />
              {/* Filled Track Range */}
              <div
                className="absolute h-1.5 bg-blue-600 rounded-lg pointer-events-none"
                style={{
                  left: `${leftPercent}%`,
                  width: `${rightPercent - leftPercent}%`,
                }}
              />
              {/* Range Inputs */}
              <input
                type="range"
                min="0"
                max={MAX_LIMIT}
                step="5000"
                value={currentMin}
                onChange={handleMinChange}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  outline: 'none',
                  zIndex: currentMin > MAX_LIMIT / 2 ? 22 : 21,
                }}
              />
              <input
                type="range"
                min="0"
                max={MAX_LIMIT}
                step="5000"
                value={currentMax}
                onChange={handleMaxChange}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  outline: 'none',
                  zIndex: currentMin > MAX_LIMIT / 2 ? 21 : 22,
                }}
              />
            </div>
            {/* Range Thumbs Custom CSS style block */}
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                pointer-events: auto;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #2563eb;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                cursor: pointer;
                -webkit-appearance: none;
                transition: transform 0.1s;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.15);
              }
              input[type="range"]::-moz-range-thumb {
                pointer-events: auto;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #2563eb;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                cursor: pointer;
                transition: transform 0.1s;
              }
              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.15);
              }
            `}</style>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>$0</span>
              <span>$250,000+</span>
            </div>
          </div>

          {/* Manual inputs */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Min Price</span>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMinPrice(val);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-1.5 pl-6 pr-2.5 outline-none focus:border-blue-500/50 text-xs w-full font-semibold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Max Price</span>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxPrice(val);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-1.5 pl-6 pr-2.5 outline-none focus:border-blue-500/50 text-xs w-full font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRangeFilter;

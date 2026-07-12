import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, BarChart3 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { getCarImage } from './VehicleCard';
import { parseVehicleDescription } from '../utils/vehicleHelper';

const CompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center gap-4">
          {/* Label */}
          <div className="flex items-center gap-2 shrink-0">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Compare ({compareList.length}/3)
            </span>
          </div>

          {/* Vehicle Chips */}
          <div className="flex-1 flex gap-3 overflow-x-auto">
            {compareList.map(vehicle => {
              const { images } = parseVehicleDescription(vehicle.description || null, vehicle.model, vehicle.image_url || null);
              const img = images[0] || getCarImage(vehicle.category, vehicle.image_url || undefined);
              return (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0"
                >
                  <img
                    src={img}
                    alt={vehicle.model}
                    className="h-10 w-14 object-cover rounded-lg"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      ${vehicle.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCompare(vehicle.id)}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={clearCompare}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => navigate('/compare')}
              disabled={compareList.length < 2}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                compareList.length >= 2
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Compare
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;

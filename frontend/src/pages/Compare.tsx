import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { useCompare } from '../context/CompareContext';
import { useNavigate, Link } from 'react-router-dom';
import { parseVehicleDescription } from '../utils/vehicleHelper';
import { getCarImage } from '../components/VehicleCard';
import { BarChart3, X, ArrowRight, ArrowLeft } from 'lucide-react';

const Compare: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length < 2) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
          <div className="text-center py-24 space-y-4">
            <BarChart3 className="h-16 w-16 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-700">Not enough vehicles to compare</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Add at least 2 vehicles from the catalog to start comparing.
              </p>
            </div>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all border-none"
            >
              Browse Catalog
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const parsedVehicles = compareList.map(v => ({
    vehicle: v,
    ...parseVehicleDescription(v.description || null, v.model, v.image_url || null),
  }));

  const specRows = [
    { label: 'Price', getValue: (v: typeof parsedVehicles[0]) => `$${v.vehicle.price.toLocaleString()}` },
    { label: 'Model Year', getValue: (v: typeof parsedVehicles[0]) => v.vehicle.year.toString() },
    { label: 'Category', getValue: (v: typeof parsedVehicles[0]) => v.vehicle.category },
    { label: 'Variant', getValue: (v: typeof parsedVehicles[0]) => v.variant || 'Standard' },
    { label: 'Fuel Type', getValue: (v: typeof parsedVehicles[0]) => v.vehicle.fuel_type },
    { label: 'Transmission', getValue: (v: typeof parsedVehicles[0]) => v.vehicle.transmission },
    { label: 'Mileage', getValue: (v: typeof parsedVehicles[0]) => v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : '0 km' },
    { label: 'Engine', getValue: (v: typeof parsedVehicles[0]) => v.engine_capacity || 'N/A' },
    { label: 'Color', getValue: (v: typeof parsedVehicles[0]) => v.color || 'N/A' },
    { label: 'Stock', getValue: (v: typeof parsedVehicles[0]) => v.vehicle.quantity > 0 ? `${v.vehicle.quantity} available` : 'Out of Stock' },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <button
              onClick={() => navigate('/vehicles')}
              className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3 bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Vehicle Comparison
            </h1>
          </div>
          <button
            onClick={() => { clearCompare(); navigate('/vehicles'); }}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Vehicle Headers */}
          <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
            <div className="p-6 bg-slate-50 border-r border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Specification</span>
            </div>
            {parsedVehicles.map(({ vehicle, images }) => {
              const img = images[0] || getCarImage(vehicle.category, vehicle.image_url);
              return (
                <div key={vehicle.id} className="p-6 text-center relative border-r border-slate-100 last:border-r-0">
                  <button
                    onClick={() => removeFromCompare(vehicle.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none"
                  >
                    <X className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                  <img
                    src={img}
                    alt={vehicle.model}
                    className="h-32 w-full object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-sm font-bold text-slate-900">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-lg font-extrabold text-blue-600 font-['Outfit'] mt-1">
                    ${vehicle.price.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Spec Rows */}
          {specRows.map((row, idx) => (
            <div
              key={row.label}
              className={`grid border-b border-slate-50 last:border-b-0 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              }`}
              style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}
            >
              <div className="p-4 px-6 border-r border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {row.label}
                </span>
              </div>
              {parsedVehicles.map(pv => (
                <div key={pv.vehicle.id} className="p-4 text-center text-sm font-semibold text-slate-800 border-r border-slate-100 last:border-r-0">
                  {row.getValue(pv)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Compare;

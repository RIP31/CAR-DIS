import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Calendar, Settings, AlertCircle } from 'lucide-react';
import type { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface VehicleCardProps {
  vehicle: Vehicle;
  onUpdate?: (updated: Vehicle) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  sedan: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
  suv: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
  coupe: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
  sports: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
  convertible: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
  truck: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  hatchback: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800',
  ev: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
  luxury: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
  default: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
};

export const getCarImage = (category: string, userUrl?: string) => {
  if (userUrl && userUrl.trim().startsWith('http')) {
    return userUrl;
  }
  const cat = category.toLowerCase().trim();
  return CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default;
};

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to purchase vehicles', 'warning');
      navigate('/login');
      return;
    }

    if (vehicle.quantity <= 0) {
      showToast('This vehicle is currently out of stock', 'error');
      return;
    }

    try {
      const response = await api.post<Vehicle>(`/api/vehicles/${vehicle.id}/purchase`);
      showToast(`Successfully purchased ${vehicle.make} ${vehicle.model}!`, 'success');
      
      const history = JSON.parse(localStorage.getItem('purchases') || '[]');
      history.push({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        price: vehicle.price,
        year: vehicle.year,
        date: new Date().toISOString(),
      });
      localStorage.setItem('purchases', JSON.stringify(history));

      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Purchase failed. Please try again.';
      showToast(errorMsg, 'error');
    }
  };

  const handleRestock = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await api.post<Vehicle>(`/api/vehicles/${vehicle.id}/restock?quantity=5`);
      showToast(`Restocked 5 units of ${vehicle.make} ${vehicle.model}!`, 'success');
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err: any) {
      showToast('Restock failed.', 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      return;
    }
    try {
      await api.delete(`/api/vehicles/${vehicle.id}`);
      showToast('Vehicle deleted successfully.', 'success');
      if (onDelete) {
        onDelete(vehicle.id);
      }
    } catch (err) {
      showToast('Failed to delete vehicle.', 'error');
    }
  };

  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group relative">
      {/* Badge Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur border border-white/10 text-white px-2.5 py-1 rounded-md">
          {vehicle.category}
        </span>
        {isOutOfStock && (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-600 border border-rose-500 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
            <AlertCircle className="h-3 w-3" />
            Out of Stock
          </span>
        )}
      </div>

      {/* Vehicle Image */}
      <Link to={`/vehicles/${vehicle.id}`} className="block relative overflow-hidden h-48 w-full shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/40 to-transparent z-1" />
        <img
          src={getCarImage(vehicle.category, vehicle.image_url)}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Specifications */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div className="space-y-3.5">
          {/* Year and Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-teal-400" />
              <span>{vehicle.year}</span>
              <span>•</span>
              <span>{vehicle.transmission}</span>
            </div>
            <Link to={`/vehicles/${vehicle.id}`} className="block">
              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-teal-400 transition-colors leading-tight">
                {vehicle.make} {vehicle.model}
              </h3>
            </Link>
          </div>

          {/* Quick Specs Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-400 capitalize">
              {vehicle.fuel_type}
            </span>
            <span className="text-[10px] font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-400">
              {vehicle.quantity > 0 ? `${vehicle.quantity} available` : 'Sold out'}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-2xl font-extrabold text-white font-['Outfit']">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buttons Action bar */}
        <div className="flex gap-2.5 mt-6 pt-2 border-t border-white/5">
          {user?.role === 'ADMIN' ? (
            /* Admin Actions */
            <div className="w-full flex gap-2">
              <button
                onClick={handleRestock}
                className="flex-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Add 5 Units to stock"
              >
                Restock
              </button>
              <Link
                to={`/admin/edit-vehicle/${vehicle.id}`}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 rounded-xl transition-all flex items-center justify-center"
                title="Edit Attributes"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/10 rounded-xl transition-all cursor-pointer"
                title="Delete Vehicle"
              >
                Delete
              </button>
            </div>
          ) : (
            /* User/Guest Actions */
            <>
              <button
                onClick={handlePurchase}
                disabled={isOutOfStock}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  isOutOfStock
                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                    : 'bg-white text-black hover:bg-slate-200 shadow-md shadow-white/5'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {isOutOfStock ? 'Sold Out' : 'Purchase'}
              </button>
              <Link
                to={`/vehicles/${vehicle.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center"
              >
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;

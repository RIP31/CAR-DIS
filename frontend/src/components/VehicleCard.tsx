import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Calendar, Settings, AlertCircle, Heart } from 'lucide-react';
import type { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { parseVehicleDescription } from '../utils/vehicleHelper';

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
  const { toggleWishlist, isInWishlist, refreshWishlist } = useWishlist();
  const navigate = useNavigate();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const inWishlist = isInWishlist(vehicle.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to add to wishlist', 'warning');
      navigate('/login');
      return;
    }
    try {
      setWishlistLoading(true);
      await toggleWishlist(vehicle.id);
      await refreshWishlist();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Wishlist update failed.', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

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
      
      // Save purchase event locally for profile mapping
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

  const { variant, mileage, images } = parseVehicleDescription(vehicle.description, vehicle.model, vehicle.image_url);
  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group relative">
      {/* Badge Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 backdrop-blur border border-slate-700/30 text-white px-2.5 py-1 rounded-md shadow-sm">
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
      <Link to={`/vehicles/${vehicle.id}`} className="block relative overflow-hidden h-48 w-full shrink-0 border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent z-1" />
        <img
          src={images[0] || getCarImage(vehicle.category, vehicle.image_url)}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {user && (
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full border border-slate-200 hover:bg-white transition-colors cursor-pointer z-10 disabled:opacity-50"
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
          </button>
        )}
      </Link>

      {/* Specifications */}
      <div className="p-6 flex flex-col justify-between flex-1 bg-white">
        <div className="space-y-3.5">
          {/* Year and Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>{vehicle.year}</span>
              <span>•</span>
              <span>{vehicle.transmission}</span>
            </div>
            <Link to={`/vehicles/${vehicle.id}`} className="block">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                {vehicle.make} {vehicle.model}
              </h3>
              {variant && variant !== 'Standard' && (
                <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                  {variant}
                </span>
              )}
            </Link>
          </div>

          {/* Quick Specs Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md text-slate-600 capitalize">
              {vehicle.fuel_type}
            </span>
            <span className="text-[10px] font-semibold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md text-slate-600">
              {mileage > 0 ? `${mileage.toLocaleString()} km` : '0 km'}
            </span>
            <span className="text-[10px] font-semibold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md text-slate-600">
              {vehicle.quantity > 0 ? `${vehicle.quantity} available` : 'Sold out'}
            </span>
          </div>

          {/* Pricing & Stock status */}
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buttons Action bar */}
        <div className="flex gap-2.5 mt-6 pt-2 border-t border-slate-100">
          {user?.role === 'ADMIN' ? (
            /* Admin Actions */
            <div className="w-full flex gap-2">
              <button
                onClick={handleRestock}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/50 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Add 5 Units to stock"
              >
                Restock
              </button>
              <Link
                to={`/admin/edit-vehicle/${vehicle.id}`}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-all flex items-center justify-center"
                title="Edit Attributes"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-xl transition-all cursor-pointer"
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
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 font-bold'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {isOutOfStock ? 'Sold Out' : 'Purchase'}
              </button>
              <Link
                to={`/vehicles/${vehicle.id}`}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center"
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Eye,
  Calendar,
  Settings,
  AlertCircle,
  Heart,
  Cpu,
  Fuel,
  Palette,
  CheckCircle,
  Layers,
} from 'lucide-react';
import type { Vehicle, Purchase } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { parseVehicleDescription } from '../utils/vehicleHelper';
import { getCarImage } from './VehicleCard';
import ConfirmationModal from './ConfirmationModal';

interface VehicleListItemProps {
  vehicle: Vehicle;
  onUpdate?: (updated: Vehicle) => void;
  onDelete?: (id: string) => void;
}

const VehicleListItem: React.FC<VehicleListItemProps> = ({ vehicle, onUpdate, onDelete }) => {
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

  const [showConfirm, setShowConfirm] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const handlePurchase = (e: React.MouseEvent) => {
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

    setShowConfirm(true);
  };

  const confirmPurchase = async () => {
    try {
      setPurchaseLoading(true);
      await api.post<Purchase>('/api/purchases', {
        vehicle_id: vehicle.id,
        quantity: 1,
      });
      showToast(`Successfully purchased ${vehicle.make} ${vehicle.model}!`, 'success');

      // Fetch updated vehicle object to update stock count in catalog UI
      const updatedVehicleRes = await api.get<Vehicle>(`/api/vehicles/${vehicle.id}`);
      if (onUpdate) {
        onUpdate(updatedVehicleRes.data);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Purchase failed. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setPurchaseLoading(false);
      setShowConfirm(false);
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

  const { variant, mileage, engine_capacity, color, images } = parseVehicleDescription(
    vehicle.description || null,
    vehicle.model,
    vehicle.image_url || null
  );
  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row w-full group relative min-h-[220px] transition-all duration-300 border border-slate-200/60 shadow-sm hover:shadow-md">
      {/* Left Column: Image */}
      <div className="w-full md:w-80 shrink-0 relative overflow-hidden bg-slate-100 border-b md:border-b-0 md:border-r border-slate-100">
        <Link to={`/vehicles/${vehicle.id}`} className="block h-48 md:h-full w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent z-1" />
          <img
            src={images[0] || getCarImage(vehicle.category, vehicle.image_url)}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {/* Floating Category Badge */}
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
      </div>

      {/* Center Column: Specification Details */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-4">
          <div>
            <Link to={`/vehicles/${vehicle.id}`} className="inline-block">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                {vehicle.make} {vehicle.model}
              </h3>
              {variant && variant !== 'Standard' && (
                <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                  {variant}
                </span>
              )}
            </Link>
          </div>

          {/* Details Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Year</span>
                <span className="text-slate-800">{vehicle.year}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Gearbox</span>
                <span className="text-slate-800">{vehicle.transmission}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Fuel</span>
                <span className="text-slate-800 font-semibold">{vehicle.fuel_type}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Mileage</span>
                <span className="text-slate-800">{mileage > 0 ? `${mileage.toLocaleString()} km` : '0 km'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Engine</span>
                <span className="text-slate-800">{engine_capacity}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Color</span>
                <span className="text-slate-800">{color}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600/70" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wide">Category</span>
                <span className="text-slate-800">{vehicle.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity status badges */}
        <div className="mt-4 pt-2.5 border-t border-slate-50 flex items-center gap-2">
          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/50 px-2 py-0.5 rounded">
            {vehicle.quantity > 0 ? `${vehicle.quantity} units in stock` : 'Sold out'}
          </span>
        </div>
      </div>

      {/* Right Column: Pricing & CTAs */}
      <div className="p-5 md:p-6 w-full md:w-64 shrink-0 bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Direct price</span>
          <span className="text-2xl font-extrabold text-slate-900 font-['Outfit'] block leading-none">
            ${vehicle.price.toLocaleString()}
          </span>
          <span className="block mt-1">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                Out of Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                <CheckCircle className="h-2.5 w-2.5" />
                In Stock Ready
              </span>
            )}
          </span>
        </div>

        {/* Buttons Action bar */}
        <div className="flex flex-col gap-2 w-full mt-4">
          {user?.role === 'ADMIN' ? (
            /* Admin Actions */
            <div className="flex flex-col gap-1.5 w-full">
              <button
                onClick={handleRestock}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/50 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Add 5 Units to stock"
              >
                Restock
              </button>
              <div className="flex gap-1.5 w-full">
                <Link
                  to={`/admin/edit-vehicle/${vehicle.id}`}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider"
                  title="Edit Attributes"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-xl transition-all cursor-pointer text-xs font-bold uppercase tracking-wider"
                  title="Delete Vehicle"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            /* User/Guest Actions */
            <>
              <button
                onClick={handlePurchase}
                disabled={isOutOfStock}
                className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 font-bold'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {isOutOfStock ? 'Sold Out' : 'Reserve Vehicle'}
              </button>
              <div className="flex gap-2">
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </Link>
                {user && (
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        vehicle={vehicle}
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmPurchase}
        loading={purchaseLoading}
      />
    </div>
  );
};

export default VehicleListItem;

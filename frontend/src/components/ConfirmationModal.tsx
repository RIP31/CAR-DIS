import React from 'react';
import { X, ShoppingBag, AlertTriangle } from 'lucide-react';
import type { Vehicle } from '../types';
import { getCarImage } from './VehicleCard';
import { parseVehicleDescription } from '../utils/vehicleHelper';

interface ConfirmationModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  const { variant, images } = parseVehicleDescription(vehicle.description, vehicle.model, vehicle.image_url);
  const imageUrl = images[0] || getCarImage(vehicle.category, vehicle.image_url);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>

        {/* Vehicle Image */}
        <div className="h-36 sm:h-40 w-full overflow-hidden border-b border-slate-100 shrink-0">
          <img
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Vehicle Info */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full">
              {vehicle.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
              {vehicle.make} {vehicle.model}
            </h2>
            {variant && variant !== 'Standard' && (
              <p className="text-xs sm:text-sm font-semibold text-slate-500">{variant}</p>
            )}
          </div>

          {/* Purchase Details */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-2 border border-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Unit Price</span>
              <span className="font-bold text-slate-900 font-['Outfit']">
                ${vehicle.price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Quantity</span>
              <span className="font-bold text-slate-900">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Available Stock</span>
              <span className="font-bold text-emerald-600">{vehicle.quantity} units</span>
            </div>
            <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
              <span className="font-bold text-slate-700">Total Amount</span>
              <span className="text-lg sm:text-xl font-extrabold text-blue-600 font-['Outfit']">
                ${vehicle.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
              By confirming this purchase, you agree to proceed with the transaction. 
              This action will reserve the vehicle and reduce available inventory.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Confirm Purchase
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Purchase, Vehicle } from '../types';
import { getCarImage } from '../components/VehicleCard';
import { 
  ShoppingBag, 
  Calendar, 
  FileText, 
  Eye, 
  ChevronRight, 
  Loader2, 
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  Truck,
  XCircle,
  Building,
  User as UserIcon,
  Car
} from 'lucide-react';

const MyPurchases: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Details Modal State
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchHistory = async () => {
    try {
      const [purchasesRes, vehiclesRes] = await Promise.all([
        api.get<Purchase[]>('/api/purchases/my-purchases'),
        api.get<Vehicle[]>('/api/vehicles')
      ]);
      setPurchases(purchasesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error('Failed to load purchases history', err);
      showToast('Failed to load purchase history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleOpenDetails = (purchase: Purchase) => {
    const match = vehicles.find(v => v.id === purchase.vehicle_id) || null;
    setSelectedPurchase(purchase);
    setSelectedVehicle(match);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Payment Pending':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'Documents Pending':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'Ready for Delivery':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Payment Pending':
        return <CreditCard className="h-4 w-4" />;
      case 'Documents Pending':
        return <FileCheck className="h-4 w-4" />;
      case 'Ready for Delivery':
        return <Truck className="h-4 w-4" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTimelineSteps = (currentStatus: string) => {
    const steps = [
      { key: 'Pending', label: 'Order Placed' },
      { key: 'Confirmed', label: 'Confirmed' },
      { key: 'Payment Pending', label: 'Payment' },
      { key: 'Documents Pending', label: 'Documents' },
      { key: 'Ready for Delivery', label: 'Ready' },
      { key: 'Delivered', label: 'Delivered' }
    ];

    if (currentStatus === 'Cancelled') {
      return [{ key: 'Cancelled', label: 'Cancelled' }];
    }

    const currentIndex = steps.findIndex(s => s.key === currentStatus);
    return steps.map((s, idx) => ({
      ...s,
      isCompleted: idx < currentIndex,
      isActive: idx === currentIndex
    }));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Purchases</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage your premium vehicle orders</p>
          </div>
          <Link
            to="/vehicles"
            className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Browse Inventory <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-5 shadow-sm max-w-lg mx-auto">
            <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto" />
            <div className="space-y-1.5 px-6">
              <h2 className="text-lg font-bold text-slate-800">No purchase records found</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven't completed any purchases on the CAR-DIS showroom catalog yet. 
                Browse our collections and complete checkout!
              </p>
            </div>
            <Link
              to="/vehicles"
              className="inline-flex bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all border-none"
            >
              Explore showroom
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map(purchase => {
              const matchedVehicle = vehicles.find(v => v.id === purchase.vehicle_id);
              const imgUrl = matchedVehicle?.image_url || getCarImage(matchedVehicle?.category || 'default', undefined);
              const timelineSteps = getTimelineSteps(purchase.status);

              return (
                <div
                  key={purchase.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col md:flex-row gap-6 items-center"
                >
                  {/* Vehicle Thumbnail */}
                  <div className="h-32 w-48 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                    <img
                      src={imgUrl}
                      alt={purchase.vehicle_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Vehicle & Purchase details */}
                  <div className="flex-1 space-y-4 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                          {purchase.manufacturer} {purchase.model}
                        </h2>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                          Variant: {purchase.variant || 'Standard'} • Quantity: {purchase.quantity}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-lg font-extrabold text-blue-600 font-['Outfit']">
                          ${purchase.purchase_price.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5 justify-start sm:justify-end">
                          <Calendar className="h-3 w-3" />
                          {new Date(purchase.purchase_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Horizontal Progress Timeline */}
                    {purchase.status !== 'Cancelled' && (
                      <div className="hidden sm:flex items-center justify-between pt-2">
                        {timelineSteps.map((step, idx) => (
                          <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center relative z-10">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${
                                  step.isActive
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : step.isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'bg-white border-slate-200 text-slate-400'
                                }`}
                              >
                                {step.isCompleted ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[9px] font-bold mt-1.5 whitespace-nowrap ${
                                  step.isActive
                                    ? 'text-blue-600'
                                    : step.isCompleted
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                            {idx < timelineSteps.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 mx-2 -translate-y-4 ${
                                  step.isCompleted ? 'bg-emerald-500' : 'bg-slate-100'
                                }`}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Small layout status badge for mobile */}
                    <div className="flex sm:hidden items-center justify-between pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(purchase.status)}`}>
                        {getStatusIcon(purchase.status)}
                        {purchase.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 self-stretch justify-center">
                    <span className={`hidden md:inline-flex items-center gap-1.5 justify-center text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${getStatusColor(purchase.status)}`}>
                      {getStatusIcon(purchase.status)}
                      {purchase.status}
                    </span>
                    <button
                      onClick={() => handleOpenDetails(purchase)}
                      className="flex-1 md:w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>
                    <Link
                      to={`/invoice/${purchase.id}`}
                      className="flex-1 md:w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
                    >
                      <FileText className="h-4 w-4" />
                      Invoice
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Purchase Details Modal */}
        {selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedPurchase(null)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in-up">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Purchase Specifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Order ID: #{selectedPurchase.id}</p>
                </div>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                >
                  <XCircle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6">
                {/* Visual Status Indicator */}
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/50">
                  <div className={`p-2.5 rounded-xl ${getStatusColor(selectedPurchase.status)} shrink-0`}>
                    {getStatusIcon(selectedPurchase.status)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Order Status</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">{selectedPurchase.status}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Invoice #</span>
                    <span className="text-xs font-mono font-bold text-slate-700 block mt-1">{selectedPurchase.invoice_number}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Car className="h-4 w-4 text-blue-600" />
                      Vehicle Specifications
                    </h4>
                    
                    {selectedVehicle && (
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                        <img
                          src={selectedVehicle.image_url || getCarImage(selectedVehicle.category, undefined)}
                          alt={selectedPurchase.vehicle_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Manufacturer</span>
                        <span>{selectedPurchase.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Model</span>
                        <span>{selectedPurchase.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Variant</span>
                        <span>{selectedPurchase.variant || 'Standard'}</span>
                      </div>
                      {selectedVehicle && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-normal">Category</span>
                            <span>{selectedVehicle.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-normal">Model Year</span>
                            <span>{selectedVehicle.year}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Purchase Transaction details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                      Transaction Information
                    </h4>

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Purchase Date</span>
                        <span>
                          {new Date(selectedPurchase.purchase_date).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Quantity</span>
                        <span>{selectedPurchase.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Unit Price</span>
                        <span>${(selectedPurchase.purchase_price / selectedPurchase.quantity).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm">
                        <span className="text-slate-800 font-bold">Total Amount Paid</span>
                        <span className="text-base font-extrabold text-blue-600 font-['Outfit']">
                          ${selectedPurchase.purchase_price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Dealership Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        Dealership Branch
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        CAR-DIS Detroit Main Branch<br />
                        100 Woodward Avenue, Detroit, MI<br />
                        support@car-dis.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none"
                >
                  Close
                </button>
                <Link
                  to={`/invoice/${selectedPurchase.id}`}
                  onClick={() => setSelectedPurchase(null)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  View Invoice PDF
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyPurchases;

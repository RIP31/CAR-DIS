import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  User as UserIcon,
  Car,
  Lock,
  History,
  ClipboardList,
  Sliders
} from 'lucide-react';

const MyPurchases: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

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
      showToast('Failed to load reservation history.', 'error');
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
      case 'Reservation Submitted':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Dealer Reviewing':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'Finance Approval':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'Documents Verified':
        return 'bg-teal-50 text-teal-600 border border-teal-200';
      case 'Payment Pending':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'Payment Received':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Ready for Delivery':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700 border border-rose-300';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reservation Submitted':
        return <ClipboardList className="h-4 w-4" />;
      case 'Dealer Reviewing':
        return <Clock className="h-4 w-4" />;
      case 'Finance Approval':
        return <CreditCard className="h-4 w-4" />;
      case 'Documents Verified':
        return <FileCheck className="h-4 w-4" />;
      case 'Payment Pending':
        return <Clock className="h-4 w-4" />;
      case 'Payment Received':
        return <CheckCircle className="h-4 w-4" />;
      case 'Ready for Delivery':
        return <Truck className="h-4 w-4" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Helper to check if invoice can be downloaded (Payment Received, Ready for Delivery, Delivered)
  const isInvoiceAvailable = (status: string) => {
    return ['Payment Received', 'Ready for Delivery', 'Delivered'].includes(status);
  };

  const parseTimeline = (timelineStr?: string) => {
    if (!timelineStr) return [];
    try {
      return JSON.parse(timelineStr);
    } catch (e) {
      console.error('Failed to parse timeline JSON', e);
      return [];
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Reservations</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage your luxury vehicle reservations and status timeline</p>
          </div>
          <Link
            to="/vehicles"
            className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Browse Catalog <ChevronRight className="h-4 w-4" />
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
              <h2 className="text-lg font-bold text-slate-800">No active reservations</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven't reserved any vehicles yet. Explore our premium inventory and submit a reservation request to get started!
              </p>
            </div>
            <Link
              to="/vehicles"
              className="inline-flex bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all border-none"
            >
              Explore Showroom
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map(purchase => {
              const matchedVehicle = vehicles.find(v => v.id === purchase.vehicle_id);
              const imgUrl = matchedVehicle?.image_url || getCarImage(matchedVehicle?.category || 'default', undefined);
              const invoiceEnabled = isInvoiceAvailable(purchase.status);

              return (
                <div
                  key={purchase.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 flex flex-col md:flex-row gap-6 items-center"
                >
                  {/* Vehicle Thumbnail */}
                  <div className="h-32 w-48 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 relative">
                    <img
                      src={imgUrl}
                      alt={purchase.vehicle_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Vehicle & Reservation details */}
                  <div className="flex-1 space-y-3 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold">
                            {purchase.reservation_number || 'No Reservation Number'}
                          </span>
                          {purchase.expected_delivery_date && (
                            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-bold">
                              Exp. Delivery: {purchase.expected_delivery_date}
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight mt-1.5">
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
                          Reserved: {new Date(purchase.purchase_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Progress Summary */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${getStatusColor(purchase.status)}`}>
                          {getStatusIcon(purchase.status)}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Workflow Phase</span>
                          <span className="text-xs font-bold text-slate-700 block mt-1">{purchase.status}</span>
                        </div>
                      </div>
                      
                      {purchase.dealer_notes && (
                        <div className="max-w-md text-xs text-slate-500 border-l-2 border-blue-400 pl-3 py-0.5 truncate italic">
                          Dealer: "{purchase.dealer_notes}"
                        </div>
                      )}
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
                    {invoiceEnabled ? (
                      <Link
                        to={`/invoice/${purchase.id}`}
                        className="flex-1 md:w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <FileText className="h-4 w-4" />
                        Invoice
                      </Link>
                    ) : (
                      <button
                        disabled
                        title="Invoice is unlocked once payment is confirmed by the dealership."
                        className="flex-1 md:w-full py-2.5 px-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Locked
                      </button>
                    )}
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
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in-up">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Reservation Dossier</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Reservation ID: {selectedPurchase.reservation_number || selectedPurchase.id}</p>
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Workflow Status</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">{selectedPurchase.status}</span>
                  </div>
                  
                  {selectedPurchase.expected_delivery_date && (
                    <div className="ml-auto text-right bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-1.5">
                      <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block leading-none">Expected Delivery</span>
                      <span className="text-xs font-bold text-indigo-700 block mt-1">{selectedPurchase.expected_delivery_date}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Vehicle & Transaction details */}
                  <div className="space-y-6">
                    
                    {/* Vehicle block */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
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
                          <span className="text-slate-500 font-normal">Model/Manufacturer</span>
                          <span>{selectedPurchase.manufacturer} {selectedPurchase.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Variant</span>
                          <span>{selectedPurchase.variant || 'Standard'}</span>
                        </div>
                        {selectedVehicle && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-normal">Model Year</span>
                            <span>{selectedVehicle.year}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Booking Value</span>
                          <span className="text-blue-600 font-bold">${selectedPurchase.purchase_price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <Sliders className="h-4 w-4 text-blue-600" />
                        Booking Preferences
                      </h4>
                      
                      <div className="space-y-2 text-xs font-semibold text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Finance Scheme Required</span>
                          <span>{selectedPurchase.finance_required ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Trade-in Option</span>
                          <span>{selectedPurchase.trade_in_required ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Dealer Visit Schedule</span>
                          <span>{selectedPurchase.preferred_visit_date} @ {selectedPurchase.preferred_visit_time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    {selectedPurchase.customer_notes && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer notes</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">"{selectedPurchase.customer_notes}"</p>
                      </div>
                    )}

                    {/* Dealer Response Notes */}
                    {selectedPurchase.dealer_notes && (
                      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Dealership Remarks</span>
                        <p className="text-xs text-blue-800 leading-relaxed font-bold">"{selectedPurchase.dealer_notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Customer Dossier & Timeline History */}
                  <div className="space-y-6">
                    
                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                        Customer Dossier
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 font-semibold">
                        <div>
                          <p className="text-slate-400 font-normal">Full Name</p>
                          <p className="mt-0.5">{selectedPurchase.phone !== 'N/A' ? (selectedPurchase as any).customer_name || user?.name : user?.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Phone</p>
                          <p className="mt-0.5">{selectedPurchase.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 font-normal">Residential Address</p>
                          <p className="mt-0.5 leading-relaxed font-normal text-slate-600">
                            {selectedPurchase.address_line}, {selectedPurchase.city}, {selectedPurchase.state}, {selectedPurchase.postal_code}, {selectedPurchase.country}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Identity Verified</p>
                          <p className="mt-0.5">{selectedPurchase.govt_id_type} ({selectedPurchase.govt_id_number})</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Date of Birth</p>
                          <p className="mt-0.5">{selectedPurchase.date_of_birth}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <History className="h-4 w-4 text-blue-600" />
                        Reservation Timeline Log
                      </h4>

                      <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 mt-2 max-h-[220px] overflow-y-auto pr-2">
                        {parseTimeline(selectedPurchase.timeline).map((log: any, idx: number) => (
                          <div key={idx} className="relative">
                            {/* Bullet */}
                            <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 bg-blue-600 border-2 border-white rounded-full" />
                            <div className="space-y-0.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold text-slate-800">{log.status}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {new Date(log.timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-normal">{log.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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
                {isInvoiceAvailable(selectedPurchase.status) ? (
                  <Link
                    to={`/invoice/${selectedPurchase.id}`}
                    onClick={() => setSelectedPurchase(null)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <FileText className="h-4 w-4" />
                    Download Invoice
                  </Link>
                ) : (
                  <div className="flex-1 py-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                    Invoice Locked (Pending Payment)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyPurchases;

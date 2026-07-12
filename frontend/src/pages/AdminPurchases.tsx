import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Purchase, Vehicle, PurchaseStatus } from '../types';
import { getCarImage } from '../components/VehicleCard';
import { 
  ShoppingBag, 
  FileText, 
  Loader2, 
  Clock,
  XCircle,
  User as UserIcon,
  Car,
  Mail,
  Shield,
  Search,
  DollarSign,
  ClipboardList,
  Sliders,
  History,
  Lock,
  Edit2
} from 'lucide-react';

const STATUS_OPTIONS: PurchaseStatus[] = [
  'Reservation Submitted',
  'Dealer Reviewing',
  'Finance Approval',
  'Documents Verified',
  'Payment Pending',
  'Payment Received',
  'Ready for Delivery',
  'Delivered',
  'Rejected',
  'Cancelled'
];

const AdminPurchases: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Details Modal State
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit form state in Modal
  const [editStatus, setEditStatus] = useState<PurchaseStatus>('Reservation Submitted');
  const [editDealerNotes, setEditDealerNotes] = useState('');
  const [editExpectedDeliveryDate, setEditExpectedDeliveryDate] = useState('');

  const fetchAllPurchases = async () => {
    try {
      const [purchasesRes, vehiclesRes] = await Promise.all([
        api.get<Purchase[]>('/api/admin/purchases'),
        api.get<Vehicle[]>('/api/vehicles')
      ]);
      setPurchases(purchasesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error('Failed to load purchases', err);
      showToast('Failed to load sales database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAllPurchases();
    } else {
      navigate('/');
    }
  }, [user]);

  const handleOpenDetails = (purchase: Purchase) => {
    const match = vehicles.find(v => v.id === purchase.vehicle_id) || null;
    setSelectedPurchase(purchase);
    setSelectedVehicle(match);
    setEditStatus(purchase.status);
    setEditDealerNotes(purchase.dealer_notes || '');
    setEditExpectedDeliveryDate(purchase.expected_delivery_date || '');
  };

  // Status Change directly from Table
  const handleStatusChangeInline = async (purchaseId: string, newStatus: PurchaseStatus) => {
    setUpdatingId(purchaseId);
    try {
      const response = await api.patch<Purchase>(`/api/admin/purchases/${purchaseId}/status`, {
        status: newStatus
      });
      showToast(`Status updated to ${newStatus} successfully!`, 'success');
      
      // Update local state
      setPurchases(prev => prev.map(p => p.id === purchaseId ? response.data : p));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update reservation status.';
      showToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Full detail update (status, dealer notes, delivery date) from Modal
  const handleDetailUpdate = async () => {
    if (!selectedPurchase) return;
    setUpdatingId(selectedPurchase.id);
    try {
      const response = await api.patch<Purchase>(`/api/admin/purchases/${selectedPurchase.id}/status`, {
        status: editStatus,
        dealer_notes: editDealerNotes.trim() || null,
        expected_delivery_date: editExpectedDeliveryDate.trim() || null
      });
      showToast(`Reservation dossier updated successfully!`, 'success');
      
      // Update local state list
      setPurchases(prev => prev.map(p => p.id === selectedPurchase.id ? response.data : p));
      // Update modal copy
      setSelectedPurchase(response.data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update reservation dossier.';
      showToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };



  const isInvoiceAvailable = (status: any) => {
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

  // Filter purchases by search query (customer name, customer email, vehicle name, reservation #, invoice #)
  const filteredPurchases = purchases.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (p.customer_name && p.customer_name.toLowerCase().includes(query)) ||
      (p.customer_email && p.customer_email.toLowerCase().includes(query)) ||
      (p.vehicle_name && p.vehicle_name.toLowerCase().includes(query)) ||
      (p.reservation_number && p.reservation_number.toLowerCase().includes(query)) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(query)) ||
      p.id.toLowerCase().includes(query)
    );
  });

  // Calculate metrics
  const activeReservations = purchases.filter(p => !['Delivered', 'Rejected', 'Cancelled'].includes(p.status)).length;
  const totalVolumeSales = purchases.reduce((acc, p) => !['Rejected', 'Cancelled'].includes(p.status) ? acc + p.purchase_price : acc, 0);
  const totalSubmissions = purchases.length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
              Dealership Reservation Panel
            </h1>
            <p className="text-sm text-slate-500 mt-1">Review profiles, finance qualifications, verify documents, and schedule deliveries</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, reservation no, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all text-slate-700 shadow-sm"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Deal Value</span>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">${totalVolumeSales.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">Excluding rejected/cancelled reservations</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Submissions</span>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-5 w-5 text-blue-600 shrink-0" />
              <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{totalSubmissions}</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">Total reservation requests in database</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{activeReservations}</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">Reservations undergoing review or fulfillment</span>
          </div>
        </div>

        {/* Table list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No reservations match this search query</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Try refining your keyword or filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Reservation No</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Vehicle Reserved</th>
                    <th className="p-4 text-right">Deal Price</th>
                    <th className="p-4">Preferred Visit</th>
                    <th className="p-4">Workflow status</th>
                    <th className="p-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map(purchase => (
                    <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-mono text-[10px] text-slate-400">
                        <span className="block font-bold text-slate-800 text-[11px] mb-0.5">{purchase.reservation_number || 'N/A'}</span>
                        #{purchase.id.slice(0, 8).toUpperCase()}...
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{purchase.customer_name}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {purchase.customer_email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{purchase.vehicle_name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">Variant: {purchase.variant || 'Standard'} • Qty: {purchase.quantity}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-extrabold text-blue-600 font-['Outfit'] text-sm">
                        ${purchase.purchase_price.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        <div className="flex flex-col">
                          <span>{purchase.preferred_visit_date}</span>
                          <span className="text-[10px] text-slate-400">{purchase.preferred_visit_time}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {updatingId === purchase.id ? (
                          <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-bold">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Updating...
                          </div>
                        ) : (
                          <select
                            value={purchase.status}
                            onChange={(e) => handleStatusChangeInline(purchase.id, e.target.value as PurchaseStatus)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider outline-none text-slate-700 focus:border-slate-400 cursor-pointer"
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleOpenDetails(purchase)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer border-none"
                            title="Manage Reservation Dossier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {isInvoiceAvailable(purchase.status) ? (
                            <Link
                              to={`/invoice/${purchase.id}`}
                              className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center justify-center"
                              title="Print Invoice Receipt"
                            >
                              <FileText className="h-4 w-4" />
                            </Link>
                          ) : (
                            <button
                              disabled
                              title="Invoice locked until payment is received."
                              className="p-2 bg-slate-50 border border-slate-200 text-slate-300 rounded-lg cursor-not-allowed"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Dossier Management Modal */}
        {selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedPurchase(null)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in-up">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Manage Dealership Reservation Dossier</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dossier ID: {selectedPurchase.reservation_number || selectedPurchase.id}</p>
                </div>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                >
                  <XCircle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Admin Status & Notes Form Panel */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Workflow status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as PurchaseStatus)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Expected delivery date</label>
                    <input
                      type="date"
                      value={editExpectedDeliveryDate}
                      onChange={(e) => setEditExpectedDeliveryDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Dealer Remarks / Internal Notes</label>
                    <textarea
                      value={editDealerNotes}
                      onChange={(e) => setEditDealerNotes(e.target.value)}
                      rows={2}
                      placeholder="Add agent assignments, trade-in valuations, checkoff comments..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={handleDetailUpdate}
                      disabled={updatingId !== null}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border-none shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {updatingId === selectedPurchase.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Dossier Changes'
                      )}
                    </button>
                  </div>
                </div>

                {/* Dossier Grid Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold">
                  
                  {/* Left Column: Client Dossier & Preferences */}
                  <div className="space-y-6">
                    
                    {/* Client info */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                        Client Identity & Address
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-slate-400 font-normal">Full Name</p>
                          <p className="mt-0.5 font-bold text-slate-800">{selectedPurchase.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Email Address</p>
                          <p className="mt-0.5 text-slate-600 font-semibold">{selectedPurchase.customer_email}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Primary Mobile</p>
                          <p className="mt-0.5">{selectedPurchase.phone}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Alt Mobile</p>
                          <p className="mt-0.5">{selectedPurchase.alternate_phone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 font-normal">Billing & Residence Address</p>
                          <p className="mt-0.5 leading-relaxed font-normal text-slate-600">
                            {selectedPurchase.address_line}, {selectedPurchase.city}, {selectedPurchase.state}, {selectedPurchase.postal_code}, {selectedPurchase.country}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Government ID Verified</p>
                          <p className="mt-0.5">{selectedPurchase.govt_id_type} : {selectedPurchase.govt_id_number}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">Driving License</p>
                          <p className="mt-0.5">{selectedPurchase.driving_license_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-normal">DOB</p>
                          <p className="mt-0.5">{selectedPurchase.date_of_birth}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking preferences */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <Sliders className="h-4 w-4 text-blue-600" />
                        Purchase Preferences
                      </h4>
                      <div className="space-y-2 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Finance Required</span>
                          <span>{selectedPurchase.finance_required ? 'YES (Loan Request)' : 'NO (Cash Purchase)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Trade-In Swap requested</span>
                          <span>{selectedPurchase.trade_in_required ? 'YES (Vehicle valuation needed)' : 'NO'}</span>
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
                  </div>

                  {/* Right Column: Vehicle specs & audit log */}
                  <div className="space-y-6">
                    
                    {/* Vehicle */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <Car className="h-4 w-4 text-blue-600" />
                        Vehicle Reserved
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
                          <span className="text-slate-500 font-normal">Manufacturer / Model</span>
                          <span>{selectedPurchase.manufacturer} {selectedPurchase.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Variant</span>
                          <span>{selectedPurchase.variant || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-normal">Booking Price</span>
                          <span className="text-blue-600 font-bold">${selectedPurchase.purchase_price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                        <History className="h-4 w-4 text-blue-600" />
                        Audit History log
                      </h4>

                      <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 mt-2 max-h-[180px] overflow-y-auto pr-2">
                        {parseTimeline(selectedPurchase.timeline).map((log: any, idx: number) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 bg-blue-600 border-2 border-white rounded-full" />
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold text-slate-800">{log.status}</span>
                                <span className="text-[10px] text-slate-400 font-semibold font-mono">
                                  {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-500 font-normal">{log.note}</p>
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
                    Download Invoice PDF
                  </Link>
                ) : (
                  <button
                    disabled
                    title="Invoice will unlock when status is changed to Payment Received, Ready for Delivery or Delivered."
                    className="flex-1 py-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Invoice Locked (Pending Payment)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPurchases;

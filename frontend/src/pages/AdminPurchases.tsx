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
  Calendar, 
  FileText, 
  Eye, 
  Loader2, 
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  Truck,
  XCircle,
  User as UserIcon,
  Car,
  Mail,
  Shield,
  Search,
  DollarSign
} from 'lucide-react';

const STATUS_OPTIONS: PurchaseStatus[] = [
  'Pending',
  'Confirmed',
  'Payment Pending',
  'Documents Pending',
  'Ready for Delivery',
  'Delivered',
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
  };

  const handleStatusChange = async (purchaseId: string, newStatus: PurchaseStatus) => {
    setUpdatingId(purchaseId);
    try {
      const response = await api.patch<Purchase>(`/api/admin/purchases/${purchaseId}/status`, {
        status: newStatus
      });
      showToast(`Status updated to ${newStatus} successfully!`, 'success');
      
      // Update local state
      setPurchases(prev => prev.map(p => p.id === purchaseId ? response.data : p));
      
      // If modal is open, update modal too
      if (selectedPurchase && selectedPurchase.id === purchaseId) {
        setSelectedPurchase(response.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update order status.';
      showToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
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

  // Filter purchases by search query (customer name, customer email, vehicle name, invoice #)
  const filteredPurchases = purchases.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.customer_name.toLowerCase().includes(query) ||
      p.customer_email.toLowerCase().includes(query) ||
      p.vehicle_name.toLowerCase().includes(query) ||
      p.invoice_number.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );
  });

  // Calculate total metrics
  const totalSales = purchases.reduce((acc, p) => p.status !== 'Cancelled' ? acc + p.purchase_price : acc, 0);
  const totalOrders = purchases.length;
  const activeOrders = purchases.filter(p => p.status !== 'Delivered' && p.status !== 'Cancelled').length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-rose-600" />
              Sales & Purchase Administration
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage global user purchase transactions and status workflows</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all text-slate-700"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume Sales</span>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">${totalSales.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">Excluding cancelled orders</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Transactions</span>
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-5 w-5 text-blue-600 shrink-0" />
              <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{totalOrders}</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">Recorded in sales database</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipelines</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{activeOrders}</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">Pending delivery or documents</span>
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
            <h3 className="text-sm font-bold text-slate-800">No purchases matching query found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Try refining your search keyword or check back later.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Invoice / ID</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Vehicle Details</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4">Purchase Date</th>
                    <th className="p-4">Workflow Status</th>
                    <th className="p-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map(purchase => (
                    <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-mono text-[10px] text-slate-400">
                        <span className="block font-bold text-slate-800 text-[11px] mb-0.5">{purchase.invoice_number}</span>
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
                          <span className="text-[10px] text-slate-500">Variant: {purchase.variant || 'Standard'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">{purchase.quantity}</td>
                      <td className="p-4 text-right font-extrabold text-blue-600 font-['Outfit'] text-sm">
                        ${purchase.purchase_price.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(purchase.purchase_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
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
                            onChange={(e) => handleStatusChange(purchase.id, e.target.value as PurchaseStatus)}
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
                            title="View Purchase Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/invoice/${purchase.id}`}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center justify-center"
                            title="Print Invoice Receipt"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                {/* Visual Status Indicator & Admin Controller */}
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/50">
                  <div className={`p-2.5 rounded-xl ${getStatusColor(selectedPurchase.status)} shrink-0`}>
                    {getStatusIcon(selectedPurchase.status)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Order Status</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">{selectedPurchase.status}</span>
                  </div>
                  <div className="ml-auto text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Admin Control</span>
                    <select
                      value={selectedPurchase.status}
                      onChange={(e) => handleStatusChange(selectedPurchase.id, e.target.value as PurchaseStatus)}
                      disabled={updatingId !== null}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none text-slate-700 focus:border-slate-400 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Customer Name</span>
                        <span>{selectedPurchase.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Customer Email</span>
                        <span>{selectedPurchase.customer_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">User Identifier ID</span>
                        <span className="font-mono text-[10px] text-slate-500">{selectedPurchase.user_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Car className="h-4 w-4 text-blue-600" />
                      Vehicle Specifications
                    </h4>
                    {selectedVehicle && (
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 mb-2">
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
                </div>

                {/* Purchase Transaction details */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Transaction & Pricing Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <span className="text-slate-400 font-normal">Invoice Number</span>
                        <span className="font-mono text-xs font-bold">{selectedPurchase.invoice_number}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-normal">Quantity Purchased</span>
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
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
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

export default AdminPurchases;

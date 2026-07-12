import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Calendar, Key, ShieldCheck, ShoppingCart, Car, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Purchase, PurchaseStatus } from '../types';

const STATUS_STEPS: { label: string; value: PurchaseStatus }[] = [
  { label: 'Submitted', value: 'Reservation Submitted' },
  { label: 'Reviewing', value: 'Dealer Reviewing' },
  { label: 'Verified', value: 'Documents Verified' },
  { label: 'Payment Pending', value: 'Payment Pending' },
  { label: 'Payment Received', value: 'Payment Received' },
  { label: 'Delivering', value: 'Ready for Delivery' },
  { label: 'Delivered', value: 'Delivered' },
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.get<Purchase[]>('/api/purchases/my-purchases');
        setPurchases(response.data);
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to load purchases', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [user, showToast]);

  if (!user) return null;

  const getStatusIndex = (status: PurchaseStatus) => {
    const idx = STATUS_STEPS.findIndex((s) => s.value === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header Title */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Profile Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registration credentials and view purchase history</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* User Profile Panel */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-3.5 pb-6 border-b border-slate-100">
              <div className="h-20 w-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <User className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {user.role} Account
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm font-semibold">
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-blue-600/60 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-1">Email Address</span>
                  <span className="text-slate-800">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Key className="h-4.5 w-4.5 text-blue-600/60 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-1">Security Identifier</span>
                  <span className="text-slate-600 font-mono text-xs truncate max-w-[200px] block">{user.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5 text-blue-600/60 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-1">Registered Since</span>
                  <span className="text-slate-800">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {user.role === 'ADMIN' && (
                <div className="flex items-center gap-3 pt-2">
                  <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0" />
                  <span className="text-xs text-rose-600 uppercase tracking-widest font-bold">Admin Privileges Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Purchases History Panel */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Purchase History ({purchases.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
                <Car className="h-10 w-10 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">No purchases found</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    You haven't purchased any vehicles from our inventory list yet.
                  </p>
                </div>
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all border-none"
                >
                  Explore Showroom
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {purchases.map((purchase) => {
                  const statusIndex = getStatusIndex(purchase.status);
                  return (
                    <div key={purchase.id} className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{purchase.vehicle_name}</h4>
                          <p className="text-xs text-slate-500">
                            {new Date(purchase.purchase_date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-extrabold text-blue-600 font-['Outfit']">
                            ${purchase.purchase_price.toLocaleString()}
                          </span>
                          <Link
                            to={`/invoice/${purchase.id}`}
                            className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Invoice
                          </Link>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {STATUS_STEPS.map((step, idx) => {
                          const isActive = idx <= statusIndex;
                          const isCurrent = step.value === purchase.status;
                          return (
                            <div key={step.value} className="flex items-center gap-1">
                              <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                <div
                                  className={`h-2.5 w-2.5 rounded-full border-2 transition-colors ${
                                    isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                                  }`}
                                />
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                    isCurrent ? 'text-blue-600' : isActive ? 'text-slate-600' : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`h-0.5 w-4 sm:w-6 rounded-full ${idx < statusIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;

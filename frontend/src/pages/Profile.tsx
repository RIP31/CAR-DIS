import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Key, ShieldCheck, ShoppingCart, Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LocalPurchase {
  id: string;
  make: string;
  model: string;
  price: number;
  year: number;
  date: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [purchaseHistory, setPurchaseHistory] = useState<LocalPurchase[]>([]);

  useEffect(() => {
    // Load local storage purchase events
    const history = JSON.parse(localStorage.getItem('purchases') || '[]');
    setPurchaseHistory(history);
  }, []);

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header Title */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Profile Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registration credentials and view purchase event history</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* User Profile Panel */}
          <div className="glass p-8 rounded-3xl border border-white/5 bg-[#0d0e12]/60 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3.5 pb-6 border-b border-white/5">
              <div className="h-20 w-20 rounded-full bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
                <User className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 py-1 rounded-full">
                  {user.role} Account
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm font-semibold">
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-teal-400/50 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-1">Email Address</span>
                  <span className="text-slate-200">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Key className="h-4.5 w-4.5 text-teal-400/50 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-1">Security Identifier</span>
                  <span className="text-slate-400 font-mono text-xs truncate max-w-[200px] block">{user.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5 text-teal-400/50 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-none mb-1">Registered Since</span>
                  <span className="text-slate-200">
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
                  <ShieldCheck className="h-5 w-5 text-rose-400 shrink-0" />
                  <span className="text-xs text-rose-400 uppercase tracking-widest font-bold">Admin Privileges Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Purchases History Panel */}
          <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5 bg-[#0d0e12]/30 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-teal-400" />
              Purchase Event Log ({purchaseHistory.length})
            </h3>

            {purchaseHistory.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-white/2 rounded-2xl border border-white/5">
                <Car className="h-10 w-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-300">No purchases found</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    You haven't purchased any vehicles from our inventory list yet.
                  </p>
                </div>
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-200 text-black px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all border-none"
                >
                  Explore Showroom
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.map((purchase, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white/3 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {purchase.year} {purchase.make} {purchase.model}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Purchased on {new Date(purchase.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-teal-400 font-['Outfit']">
                        ${purchase.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;

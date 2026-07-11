import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Purchase } from '../types';
import { FileText, Printer, ChevronLeft, Building2 } from 'lucide-react';

const Invoice: React.FC = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { user } = useAuth();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const response = await api.get<Purchase>(`/api/purchases/${purchaseId}`);
        setPurchase(response.data);
      } catch (err) {
        console.error('Failed to fetch purchase', err);
      } finally {
        setLoading(false);
      }
    };
    if (purchaseId) fetchPurchase();
  }, [purchaseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-700">Invoice not found</h2>
          <Link
            to="/profile"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const invoiceDate = new Date(purchase.purchase_date);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0">
      {/* Print Controls (hidden in print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </button>
      </div>

      {/* Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 print:bg-slate-900">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <h1 className="text-xl font-extrabold tracking-tight font-['Outfit']">CAR-DIS</h1>
              </div>
              <p className="text-xs text-slate-400">Premium Auto Dealership</p>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight">INVOICE</h2>
              <p className="text-xs text-slate-400 font-mono">#{purchase.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-8">
          {/* Customer & Invoice Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bill To</span>
              <p className="text-sm font-bold text-slate-900">{user?.name || 'Customer'}</p>
              <p className="text-xs text-slate-500">{user?.email || ''}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Invoice Date</span>
              <p className="text-sm font-bold text-slate-900">
                {invoiceDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                  purchase.status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : purchase.status === 'Cancelled'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                {purchase.status}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="text-center p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Price</th>
                  <th className="text-right p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-semibold text-slate-900">{purchase.vehicle_name}</td>
                  <td className="p-4 text-center text-slate-600">{purchase.quantity}</td>
                  <td className="p-4 text-right text-slate-600 font-['Outfit']">
                    ${(purchase.purchase_price / purchase.quantity).toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900 font-['Outfit']">
                    ${purchase.purchase_price.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900 font-['Outfit']">
                  ${purchase.purchase_price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (0%)</span>
                <span className="font-semibold text-slate-900">$0.00</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-xl font-extrabold text-blue-600 font-['Outfit']">
                  ${purchase.purchase_price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400">
              Thank you for choosing CAR-DIS. For questions about this invoice, contact support@car-dis.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

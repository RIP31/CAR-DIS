import React, { useState } from 'react';
import { Phone, Clock, Mail, Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const CONTACT = {
  phone: '+971 4 377 2503',
  email: 'info@cardis.ae',
  address: 'Showroom 17, 18 & 20, Al Asayel Street, Al Quoz Ind 1, Dubai, UAE',
  hours: 'Sun - Sat: 9:30 AM - 10:00 PM',
};

interface CallbackFormData {
  name: string;
  phone: string;
  preferred_time: string;
  message: string;
}

const CallbackForm: React.FC = () => {
  const [form, setForm] = useState<CallbackFormData>({ name: '', phone: '', preferred_time: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/callbacks', form);
      showToast('Callback request submitted successfully! We will contact you soon.', 'success');
      setForm({ name: '', phone: '', preferred_time: '', message: '' });
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to submit callback request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl border border-white/5 bg-[#0d0e12]/60 p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Request a Callback</h3>
        <p className="text-slate-400 text-sm">Fill in your details and our team will call you back at your preferred time.</p>
      </div>

      {/* Dealer Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 bg-white/3 rounded-xl p-3 border border-white/5">
          <Phone className="h-4 w-4 text-teal-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone</span>
            <a href={`tel:${CONTACT.phone}`} className="text-white text-xs font-semibold hover:text-teal-400 transition-colors">{CONTACT.phone}</a>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/3 rounded-xl p-3 border border-white/5">
          <Clock className="h-4 w-4 text-teal-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Working Hours</span>
            <span className="text-white text-xs font-semibold">{CONTACT.hours}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/3 rounded-xl p-3 border border-white/5">
          <Mail className="h-4 w-4 text-teal-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</span>
            <a href={`mailto:${CONTACT.email}`} className="text-white text-xs font-semibold hover:text-teal-400 transition-colors">{CONTACT.email}</a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-2.5 px-3 text-sm outline-none focus:border-teal-500/30 placeholder:text-slate-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+971 50 123 4567"
              className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-2.5 px-3 text-sm outline-none focus:border-teal-500/30 placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Callback Time *</label>
          <input
            type="text"
            required
            value={form.preferred_time}
            onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
            placeholder="e.g. Tomorrow 10 AM - 12 PM"
            className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-2.5 px-3 text-sm outline-none focus:border-teal-500/30 placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message (Optional)</label>
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us what you're looking for..."
            className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-2.5 px-3 text-sm outline-none focus:border-teal-500/30 placeholder:text-slate-600 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white hover:bg-slate-200 text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CallbackForm;

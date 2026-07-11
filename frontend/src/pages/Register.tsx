import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, User, Mail, Lock, AlertCircle, ShieldCheck, Car, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      showToast('Password must be at least 8 characters long', 'warning');
      return;
    }

    try {
      await register(name, email, password, role);
      await login(email, password);
      showToast(`Account created! Welcome, ${name}.`, 'success');
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Email already exists or registration failed.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-12 relative overflow-hidden text-slate-800 select-none"
    >
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[500px] bg-blue-500/5 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* Top Navbar items */}
      <div className="absolute top-8 left-8 flex items-center justify-between w-[calc(100%-4rem)] max-w-7xl">
        <Link to="/" className="text-slate-900 font-['Outfit'] font-extrabold uppercase tracking-wider text-xl flex items-center gap-2">
          <Car className="h-6 w-6 text-blue-600" />
          CAR-DIS
        </Link>
        <Link to="/" className="text-xs uppercase font-bold text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>

      <div className="w-full max-w-md animate-fade-in-up z-10">
        <div className="bg-white p-8 rounded-3xl shadow-xl relative border border-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-3 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-500 mt-1">Get started with our automotive inventory dashboard</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-700 text-xs leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    role === 'USER'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    role === 'ADMIN'
                      ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-900/10 mt-6 cursor-pointer flex items-center justify-center border-none"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

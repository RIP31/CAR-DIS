import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Mail, Lock, AlertCircle, Car, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      showToast('Signed in successfully!', 'success');
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#08090a] px-4 py-12 relative overflow-hidden text-slate-100 select-none"
    >
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[500px] bg-teal-500/5 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* Top Navbar items */}
      <div className="absolute top-8 left-8 flex items-center justify-between w-[calc(100%-4rem)] max-w-7xl">
        <Link to="/" className="text-white font-['Outfit'] font-extrabold uppercase tracking-wider text-xl flex items-center gap-2">
          <Car className="h-6 w-6 text-teal-400" />
          CAR-DIS
        </Link>
        <Link to="/" className="text-xs uppercase font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>

      <div className="w-full max-w-md animate-fade-in-up z-10">
        <div className="glass p-8 rounded-3xl shadow-2xl relative bg-[#0d0e12]/60 border border-white/5">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 bg-teal-500/10 border border-teal-500/25 rounded-2xl flex items-center justify-center mb-3 text-teal-400">
              <LogIn className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in to search, filter, and buy cars</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 bg-rose-950/40 border border-rose-800/20 p-4 rounded-xl text-rose-200 text-xs leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-600" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-teal-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-600" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-teal-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-slate-200 disabled:bg-slate-800 text-black disabled:text-slate-500 rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-white/5 mt-6 cursor-pointer flex items-center justify-center border-none"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-black"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 font-semibold">
            New to the catalog?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-bold ml-1 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

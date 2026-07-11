import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, User as UserIcon, LogOut, Shield, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'glass py-3 border-white/5 shadow-lg'
          : 'bg-[#08090a]/50 py-4 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl uppercase tracking-wider group">
          <Car className="h-6 w-6 text-teal-400 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-['Outfit'] font-extrabold">Car-Dis</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          <Link
            to="/"
            className={`transition-colors ${
              isActive('/') ? 'text-teal-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/vehicles"
            className={`transition-colors ${
              isActive('/vehicles') ? 'text-teal-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Browse Inventory
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`transition-colors ${
                isActive('/profile') ? 'text-teal-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              My Profile
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors font-bold uppercase text-xs tracking-wider border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 rounded-full ${
                isActive('/admin') ? 'ring-1 ring-rose-500/30' : ''
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          )}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <UserIcon className="h-4 w-4 text-teal-400" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5 px-3 py-1.5 rounded-full"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white hover:bg-slate-200 text-black px-5 py-2 rounded-full transition-all text-xs tracking-wider uppercase font-bold shadow-md shadow-white/5 border-none"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/20 rounded-xl"
              title="Admin Portal"
            >
              <Shield className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-xl border border-white/5 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-b border-white/5 animate-fade-in-up mt-3 py-6 px-6 space-y-4">
          <div className="flex flex-col gap-4 text-sm font-semibold tracking-wide">
            <Link
              to="/"
              className={`py-2 border-b border-white/5 ${
                isActive('/') ? 'text-teal-400 font-bold' : 'text-slate-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/vehicles"
              className={`py-2 border-b border-white/5 ${
                isActive('/vehicles') ? 'text-teal-400 font-bold' : 'text-slate-300'
              }`}
            >
              Browse Inventory
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`py-2 border-b border-white/5 ${
                  isActive('/profile') ? 'text-teal-400 font-bold' : 'text-slate-300'
                }`}
              >
                My Profile
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="py-2 border-b border-white/5 text-rose-400 font-bold flex items-center gap-1.5"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium py-1">
                  <UserIcon className="h-4 w-4 text-teal-400" />
                  <span>Logged in as: {user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-center flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10 bg-white/3 py-3 rounded-full"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full text-center bg-white text-black py-3 rounded-full transition-all text-xs tracking-wider uppercase font-bold shadow-md shadow-white/5 block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

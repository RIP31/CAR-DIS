import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Car, User as UserIcon, LogOut, Shield, Menu, X, Heart } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
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
          ? 'bg-white/80 backdrop-blur-md py-3 border-slate-200/50 shadow-sm'
          : 'bg-[#f8f9fa]/85 backdrop-blur-md py-4 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-slate-900 font-extrabold text-xl uppercase tracking-wider group">
          <Car className="h-6 w-6 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-['Outfit'] font-extrabold text-slate-900">Car-Dis</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          <Link
            to="/"
            className={`transition-colors ${
              isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </Link>
          <Link
            to="/vehicles"
            className={`transition-colors ${
              isActive('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browse Inventory
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`transition-colors ${
                isActive('/profile') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Profile
            </Link>
          )}

          <Link
            to="/wishlist"
            className={`relative transition-colors ${
              isActive('/wishlist') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors font-bold uppercase text-xs tracking-wider border border-rose-200 bg-rose-50 px-2.5 py-1 rounded-full ${
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
              <div className="flex items-center gap-2 text-slate-700 text-sm">
                <UserIcon className="h-4 w-4 text-blue-600" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-500" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full transition-all text-xs tracking-wider uppercase font-bold shadow-md shadow-slate-900/10 border-none"
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
              className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 rounded-xl"
              title="Admin Portal"
            >
              <Shield className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 animate-fade-in-up mt-3 py-6 px-6 space-y-4 shadow-md">
          <div className="flex flex-col gap-4 text-sm font-semibold tracking-wide">
            <Link
              to="/"
              className={`py-2 border-b border-slate-100 ${
                isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/vehicles"
              className={`py-2 border-b border-slate-100 ${
                isActive('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              Browse Inventory
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`py-2 border-b border-slate-100 ${
                  isActive('/profile') ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                My Profile
              </Link>
            )}
            <Link
              to="/wishlist"
              className={`py-2 border-b border-slate-100 flex items-center gap-1.5 ${
                isActive('/wishlist') ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              <Heart className="h-4 w-4" />
              Wishlist
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{wishlistCount}</span>
              )}
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="py-2 border-b border-slate-100 text-rose-600 font-bold flex items-center gap-1.5"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-700 text-sm font-medium py-1">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                  <span>Logged in as: {user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-center flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 bg-slate-50 py-3 rounded-full"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full text-center bg-slate-900 text-white py-3 rounded-full transition-all text-xs tracking-wider uppercase font-bold shadow-md shadow-slate-900/10 block"
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

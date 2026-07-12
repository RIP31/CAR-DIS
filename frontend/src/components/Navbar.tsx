import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Car, User as UserIcon, LogOut, Shield, Menu, X, Heart, Bell } from 'lucide-react';
import api from '../services/api';

interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu, notification panel and admin dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsAdminOpen(false);
  }, [location.pathname]);

  // Load notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get<DBNotification[]>('/api/notifications');
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Periodically poll for new status updates
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await api.post(`/api/notifications/${id}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.is_read).length : 0;

  // Reusable notification dropdown component
  const renderNotifDropdown = (widthClass: string) => (
    <div className={`absolute right-0 top-full mt-3 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 ${widthClass} max-h-[380px] overflow-y-auto z-50 animate-fade-in-up text-left`}>
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
        {unreadCount > 0 && (
          <span className="text-[9px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            {unreadCount} New
          </span>
        )}
      </div>
      {!Array.isArray(notifications) || notifications.length === 0 ? (
        <p className="text-[10px] text-slate-400 py-6 text-center font-normal">No updates yet.</p>
      ) : (
        <div className="space-y-2.5">
          {Array.isArray(notifications) && notifications.slice(0, 8).map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n.id, n.is_read)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                n.is_read
                  ? 'bg-white border-transparent hover:bg-slate-50'
                  : 'bg-blue-50/30 border-blue-100/50 hover:bg-blue-50/60'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[10px] font-bold ${n.is_read ? 'text-slate-700' : 'text-blue-900'}`}>{n.title}</span>
                {!n.is_read && (
                  <span className="h-1.5 w-1.5 bg-blue-600 rounded-full shrink-0 mt-1" />
                )}
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-normal font-normal">{n.message}</p>
              <span className="text-[8px] text-slate-400 font-semibold block mt-1">
                {new Date(n.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md py-2.5 border-slate-200/40 shadow-sm'
          : 'bg-[#f8f9fa]/85 backdrop-blur-md py-3.5 border-slate-200/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 text-slate-900 font-bold text-base uppercase tracking-wider group shrink-0">
          <Car className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-['Outfit'] font-extrabold text-slate-900 tracking-wider">CAR-DIS</span>
        </Link>

        {/* Desktop Links (Primary navigation only) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
          <Link
            to="/"
            className={`transition-colors py-1 ${
              isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </Link>
          <Link
            to="/vehicles"
            className={`transition-colors py-1 ${
              isActive('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browse Inventory
          </Link>

          {user && (
            <>
              <Link
                to="/my-purchases"
                className={`transition-colors py-1 ${
                  isActive('/my-purchases') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Reservations
              </Link>
              <Link
                to="/profile"
                className={`transition-colors py-1 ${
                  isActive('/profile') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Profile
              </Link>
            </>
          )}
        </div>

        {/* Desktop Right Section (Icons, Admin, Auth) */}
        <div className="hidden md:flex items-center gap-5">
          {/* Icons Group */}
          <div className="flex items-center gap-3.5">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`relative p-1 text-slate-600 hover:text-slate-900 transition-colors ${
                isActive('/wishlist') ? 'text-blue-600' : ''
              }`}
              title="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications Bell */}
            {user && (
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-1 cursor-pointer text-slate-600 hover:text-slate-900 border-none bg-transparent flex items-center"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotifOpen && renderNotifDropdown('w-80')}
              </div>
            )}
          </div>

          {/* Admin Dropdown */}
          {user?.role === 'ADMIN' && (
            <div className="relative">
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 border border-rose-200/65 px-2.5 py-1 rounded-md transition-all cursor-pointer`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
                <span className="text-[8px] transition-transform duration-200">▼</span>
              </button>
              {isAdminOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-44 z-50 animate-fade-in-up">
                  <Link
                    to="/admin"
                    onClick={() => setIsAdminOpen(false)}
                    className="block px-4 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/purchases"
                    onClick={() => setIsAdminOpen(false)}
                    className="block px-4 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    Reservations Log
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-3.5 border-l border-slate-200 pl-4">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="h-3 w-3 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md transition-all text-[10px] tracking-wider uppercase font-bold shadow-md shadow-slate-900/10 border-none"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Wishlist */}
          <Link
            to="/wishlist"
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200 relative"
            title="Wishlist"
          >
            <Heart className="h-3.5 w-3.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[12px] text-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Mobile Notifications Bell */}
          {user && (
            <div className="relative flex items-center">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200 relative cursor-pointer flex items-center justify-center"
              >
                <Bell className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[8px] font-bold px-1 rounded-full min-w-[12px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotifOpen && renderNotifDropdown('w-72')}
            </div>
          )}

          {/* Mobile Admin Dropdown */}
          {user?.role === 'ADMIN' && (
            <div className="relative flex items-center">
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 rounded-lg relative cursor-pointer"
                title="Admin Portal"
              >
                <Shield className="h-3.5 w-3.5" />
              </button>
              {isAdminOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-44 z-50 text-left">
                  <Link
                    to="/admin"
                    onClick={() => setIsAdminOpen(false)}
                    className="block px-4 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/purchases"
                    onClick={() => setIsAdminOpen(false)}
                    className="block px-4 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    Reservations Log
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 animate-fade-in-up mt-2 py-4 px-6 space-y-4 shadow-md">
          <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-wider">
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
              <>
                <Link
                  to="/my-purchases"
                  className={`py-2 border-b border-slate-100 ${
                    isActive('/my-purchases') ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  My Reservations
                </Link>
                <Link
                  to="/profile"
                  className={`py-2 border-b border-slate-100 ${
                    isActive('/profile') ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  My Profile
                </Link>
              </>
            )}
          </div>

          <div className="pt-1 flex flex-col gap-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold py-1">
                  <UserIcon className="h-3.5 w-3.5 text-blue-600" />
                  <span>Logged in as: {user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-center flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 bg-slate-50 py-2.5 rounded-md"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full text-center bg-slate-900 text-white py-2.5 rounded-md transition-all text-[10px] tracking-wider uppercase font-bold shadow-md shadow-slate-900/10 block"
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

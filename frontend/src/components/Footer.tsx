import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050608] border-t border-white/5 text-slate-400 text-sm font-medium tracking-wide">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-5">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg uppercase tracking-wider">
            <Car className="h-6 w-6 text-teal-400 glow-text-primary" />
            <span className="font-['Outfit']">Car-Dis</span>
          </Link>
          <p className="text-slate-500 leading-relaxed font-normal">
            A premium automotive marketplace experience. Discover, filter, and purchase your dream vehicle with our advanced real-time inventory system.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-slate-400 hover:text-teal-400 transition-colors">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-slate-400 hover:text-teal-400 transition-colors">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-slate-400 hover:text-teal-400 transition-colors">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest font-['Outfit']">Navigation</h4>
          <ul className="space-y-2.5 font-normal">
            <li>
              <Link to="/" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                Home Catalog
              </Link>
            </li>
            <li>
              <Link to="/vehicles" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                Browse Vehicles
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                My Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest font-['Outfit']">Featured Categories</h4>
          <ul className="space-y-2.5 font-normal">
            <li>
              <Link to="/vehicles?category=SUV" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                SUVs
              </Link>
            </li>
            <li>
              <Link to="/vehicles?category=Sedan" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                Sedans
              </Link>
            </li>
            <li>
              <Link to="/vehicles?category=Coupe" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                Coupes
              </Link>
            </li>
            <li>
              <Link to="/vehicles?category=Sports" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                Sports Cars
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest font-['Outfit']">HQ Dealership</h4>
          <ul className="space-y-3 font-normal text-slate-500">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-teal-400 mt-0.5" />
              <span>100 Automotive Blvd, Suite A<br />Detroit, MI 48201</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-teal-400" />
              <span>+1 (800) 555-DISC</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-teal-400" />
              <span>contact@car-dis.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-8 text-center text-xs text-slate-600 font-normal">
        <p>&copy; {new Date().getFullYear()} CAR-DIS Systems Inc. All rights reserved. Developed as an original concept.</p>
      </div>
    </footer>
  );
};

export default Footer;

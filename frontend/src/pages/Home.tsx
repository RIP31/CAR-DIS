import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Compass, Shield, Award, Sparkles, ArrowRight, Star, Flame } from 'lucide-react';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import VehicleCard from '../components/VehicleCard';
import { CardSkeleton } from '../components/LoadingSkeleton';

const BRANDS = [
  { name: 'Tesla', logo: '⚡' },
  { name: 'BMW', logo: '🇩🇪' },
  { name: 'Mercedes-Benz', logo: '⭐️' },
  { name: 'Toyota', logo: '🇯🇵' },
  { name: 'Ford', logo: '🇺🇸' },
  { name: 'Audi', logo: '🛞' },
];

const CATEGORIES = [
  { name: 'SUV', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=400', count: '12+ Models' },
  { name: 'Sedan', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400', count: '8+ Models' },
  { name: 'Coupe', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400', count: '5+ Models' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400', count: '4+ Models' },
  { name: 'Convertible', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400', count: '3+ Models' },
  { name: 'Truck', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400', count: '6+ Models' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await api.get<Vehicle[]>('/api/vehicles');
        const list = response.data;
        // Featured vehicles = vehicles with highest price or first few
        setFeaturedVehicles(list.slice(0, 3));
        // Latest arrivals = sorted by date or first few
        setLatestVehicles(list.slice(0, 6));
      } catch (err) {
        console.error('Failed to load home content', err);
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/vehicles');
    }
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setFeaturedVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setLatestVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  return (
    <MainLayout>
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-cover bg-center select-none overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(8, 9, 10, 0.4) 0%, rgba(8, 9, 10, 0.7) 60%, rgba(8, 9, 10, 1) 100%), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920')`
        }}
      >
        {/* Glow Element */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[500px] bg-teal-500/10 blur-[120px] rounded-full z-0" />

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 rounded-full text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Fleet Registry Redefined</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 font-['Outfit'] glow-text-primary">
              Premium Drive
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Browse our curated high-performance collection, customize your filters, and secure your purchase instantly.
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-[#0d0e12]/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
              <Search className="h-5 w-5 text-teal-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by make, model, or tags (e.g. Tesla Model S)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl sm:rounded-full transition-all border-none cursor-pointer shrink-0"
            >
              Search Catalog
            </button>
          </form>
        </div>
      </section>

      {/* 2. Popular Brands Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8 relative">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Search by Popular Brands</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quick click filter shortcuts</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BRANDS.map((brand) => (
            <Link
              key={brand.name}
              to={`/vehicles?make=${brand.name}`}
              className="glass p-5 rounded-2xl text-center hover:border-teal-400/30 hover:bg-white/3 transition-all flex flex-col items-center gap-2"
            >
              <span className="text-3xl filter saturate-100">{brand.logo}</span>
              <span className="text-sm font-bold text-white tracking-tight">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Category Carousel Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Browse by Vehicle Category</h2>
            <p className="text-sm text-slate-500 mt-1">Explore specific structural and segment configurations</p>
          </div>
          <Link to="/vehicles" className="text-teal-400 hover:text-teal-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            See All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/vehicles?category=${cat.name}`}
              className="glass-card rounded-2xl overflow-hidden flex flex-col h-48 border border-white/5 bg-[#121418]/40 hover:border-teal-500/25 transition-all group"
            >
              <div className="h-32 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#08090a]/20 group-hover:bg-transparent transition-all z-1" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 text-center flex-1 flex flex-col justify-center">
                <span className="text-sm font-bold text-white leading-tight">{cat.name}</span>
                <span className="text-[10px] text-slate-500">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Vehicles (Dynamic) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8 relative">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-teal-400 glow-text-primary" />
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Featured Vehicles</h2>
              <p className="text-sm text-slate-500 mt-1">Our premium selected high-valuation fleet models</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : featuredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white/2 rounded-2xl border border-white/5">
            <p className="text-slate-500">No vehicles available at this moment. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onUpdate={handleUpdateVehicle}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Brand Trust Banner */}
      <section className="bg-gradient-to-r from-teal-950/20 via-slate-900/30 to-cyan-950/20 py-16 border-y border-white/5 my-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3 p-4">
            <div className="p-3.5 bg-teal-500/10 rounded-2xl border border-teal-500/20 text-teal-400">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Nationwide Shipping</h3>
            <p className="text-slate-500 text-sm font-normal leading-relaxed">
              We coordinate transport logs directly to your driveway. Fully tracked and insured shipping.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3 p-4">
            <div className="p-3.5 bg-teal-500/10 rounded-2xl border border-teal-500/20 text-teal-400">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Inspections</h3>
            <p className="text-slate-500 text-sm font-normal leading-relaxed">
              Every registry entry is inspected under rigorous 150-point diagnostics standards.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3 p-4">
            <div className="p-3.5 bg-teal-500/10 rounded-2xl border border-teal-500/20 text-teal-400">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Full Buyback Guarantee</h3>
            <p className="text-slate-500 text-sm font-normal leading-relaxed">
              7-Day refund return policies with zero questions asked. Customer satisfaction first.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8 mb-8">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-amber-500" />
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Latest Arrivals</h2>
              <p className="text-sm text-slate-500 mt-1">Freshly checked inventory listings added this week</p>
            </div>
          </div>
          <Link to="/vehicles" className="text-teal-400 hover:text-teal-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            Browse Full Stock <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : latestVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white/2 rounded-2xl border border-white/5">
            <p className="text-slate-500">No arrivals listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onUpdate={handleUpdateVehicle}
              />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default Home;

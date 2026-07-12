import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Compass, Shield, Award, Sparkles, ArrowRight, Star, Flame } from 'lucide-react';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import VehicleCard from '../components/VehicleCard';
import CallbackForm from '../components/CallbackForm';
import { CardSkeleton } from '../components/LoadingSkeleton';

const BRANDS = [
  { name: 'BMW', slug: 'bmw', color: '0066B1' },
  { name: 'Mercedes', slug: 'mercedes-benz', color: '000000' },
  { name: 'Audi', slug: 'audi', color: '090A0A' },
  { name: 'Porsche', slug: 'porsche', color: 'B1272C' },
  { name: 'Lexus', slug: 'lexus', color: '000000' },
  { name: 'Toyota', slug: 'toyota', color: 'EB0A1E' },
  { name: 'Honda', slug: 'honda', color: 'E4002B' },
  { name: 'Hyundai', slug: 'hyundai', color: '002C5F' },
  { name: 'Kia', slug: 'kia', color: 'EA0A2A' },
  { name: 'Tesla', slug: 'tesla', color: 'CC0000' },
  { name: 'Volvo', slug: 'volvo', color: '003057' },
  { name: 'Ford', slug: 'ford', color: '003478' },
  { name: 'Nissan', slug: 'nissan', color: 'C3002F' },
  { name: 'Chevrolet', slug: 'chevrolet', color: 'CD9834' },
  { name: 'Jeep', slug: 'jeep', color: '0A2F1D' },
  { name: 'Land Rover', slug: 'land-rover', color: '005A2B' },
];

const CATEGORIES = [
  {
    name: 'SUV',
    image: 'https://di-uploads-pod19.dealerinspire.com/valleybuickgmc/uploads/2024/10/2025-gmc-yukon-denali-ultimate-001-1.jpg'
  },
  {
    name: 'Sedan',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Coupe',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Sports',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Convertible',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjBhcUQigHUD_Td5yjBWwyojJmnnP6y1Ou-dQM6FUh7NSliBq4ws78tkQF&s=10'
  },
  {
    name: 'Luxury',
    image: 'https://media.istockphoto.com/id/1221371590/photo/rolls-royce-phantom.jpg?s=612x612&w=0&k=20&c=wP5yIWxOu1H4BeHUCqL9QFJ6YC4ljgoJI8CH5XKwv_c='
  },
  {
    name: 'Electric',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Hatchback',
    image: 'https://hips.hearstapps.com/hmg-prod/images/2023-lightning-lap-volkswagen-golf-gti-mu-105-1675446169.jpg?crop=0.629xw:0.630xh;0.121xw,0.199xh'
  },
  {
    name: 'Pickup',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWriyJMpLEuNrgSwL15w71I4o_NFTUYYbjCOc9b0jee7aU83IlWx5hRY&s=10'
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await api.get<Vehicle[]>('/api/vehicles');
        const list = response.data;
        setVehicles(list);
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

  const getBrandCount = (brandName: string) => {
    return vehicles.filter(v => v.make.toLowerCase() === brandName.toLowerCase()).length;
  };

  const getCategoryCount = (categoryName: string) => {
    return vehicles.filter(v => {
      const cat = v.category.toLowerCase();
      const target = categoryName.toLowerCase();
      if (target === 'electric') {
        return cat === 'electric' || cat === 'ev';
      }
      return cat === target;
    }).length;
  };

  return (
    <MainLayout>
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center select-none overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.6) 60%, rgba(248, 249, 250, 1) 100%), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920')`
        }}
      >
        {/* Glow Element */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[500px] bg-blue-500/5 blur-[120px] rounded-full z-0" />

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Fleet Registry Redefined</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-none">
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-['Outfit'] font-extrabold">
              Premium Drive
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Browse our curated high-performance collection, customize your filters, and secure your purchase instantly.
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row gap-2 shadow-xl shadow-slate-200/50">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
              <Search className="h-5 w-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder="Search by make, model, or tags (e.g. Tesla Model S)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl sm:rounded-full transition-all border-none cursor-pointer shrink-0"
            >
              Search Catalog
            </button>
          </form>
        </div>
      </section>

      {/* 2. Popular Brands Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8 relative">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Search by Popular Brands</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quick click filter shortcuts</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {BRANDS.map((brand) => (
            <Link
              key={brand.name}
              to={`/vehicles?make=${brand.name}`}
              className="bg-white border border-slate-200/60 p-5 rounded-2xl text-center hover:border-blue-500/20 hover:shadow-md hover:shadow-slate-100/50 transition-all flex flex-col items-center gap-2 group shadow-sm"
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <img
                  src={`https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${brand.slug}.png`}
                  alt={`${brand.name} logo`}
                  className="h-9 w-9 object-contain grayscale opacity-65 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-slate-900 mt-1">{brand.name}</span>
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors mt-0.5">
                {getBrandCount(brand.name)} {getBrandCount(brand.name) === 1 ? 'Vehicle' : 'Vehicles'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Category Carousel Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse by Vehicle Category</h2>
            <p className="text-sm text-slate-500 mt-1">Explore specific structural and segment configurations</p>
          </div>
          <Link to="/vehicles" className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            See All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/vehicles?category=${cat.name}`}
              className="bg-white rounded-2xl overflow-hidden flex flex-col h-64 border border-slate-200 hover:border-blue-500/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
            >
              <div className="h-48 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all z-1" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-4 text-center flex-1 flex flex-col justify-center bg-white">
                <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{cat.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {getCategoryCount(cat.name)} {getCategoryCount(cat.name) === 1 ? 'in stock' : 'in stock'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Vehicles (Dynamic) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8 relative">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Featured Vehicles</h2>
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
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
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
      <section className="bg-gradient-to-r from-slate-50 via-white to-slate-50 py-16 border-y border-slate-200 my-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3 p-4">
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nationwide Shipping</h3>
            <p className="text-slate-500 text-sm font-normal leading-relaxed">
              We coordinate transport logs directly to your driveway. Fully tracked and insured shipping.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3 p-4">
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Inspections</h3>
            <p className="text-slate-500 text-sm font-normal leading-relaxed">
              Every registry entry is inspected under rigorous 150-point diagnostics standards.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3 p-4">
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Full Buyback Guarantee</h3>
            <p className="text-slate-500 text-sm font-normal leading-relaxed">
              7-Day refund return policies with zero questions asked. Customer satisfaction first.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-8 mb-8">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Latest Arrivals</h2>
              <p className="text-sm text-slate-500 mt-1">Freshly checked inventory listings added this week</p>
            </div>
          </div>
          <Link to="/vehicles" className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
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
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
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

      {/* Callback Request Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <CallbackForm />
      </section>
    </MainLayout>
  );
};

export default Home;

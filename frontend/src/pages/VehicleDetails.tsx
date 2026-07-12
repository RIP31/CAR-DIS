import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCarImage } from '../components/VehicleCard';
import VehicleCard from '../components/VehicleCard';
import { parseVehicleDescription } from '../utils/vehicleHelper';
import { ReservationWizardModal } from '../components/ReservationWizardModal';
import EmiCalculator from '../components/EmiCalculator';
import {
  ShoppingBag,
  Calendar,
  ChevronLeft,
  Fuel,
  Cpu,
  Info,
  CheckCircle,
  FileText,
  AlertTriangle,
  Calculator,
  Star,
  Sparkles,
} from 'lucide-react';

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEmi, setShowEmi] = useState(false);
  const [recommended, setRecommended] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get<Vehicle>(`/api/vehicles/${id}`);
        setVehicle(response.data);
        
        const parsed = parseVehicleDescription(response.data.description || null, response.data.model, response.data.image_url || null);
        const primaryImg = parsed.images[0] || getCarImage(response.data.category, response.data.image_url || undefined);
        setActiveImage(primaryImg);

        if (parsed.images.length > 1) {
          setThumbnails(parsed.images);
        } else {
          setThumbnails([
            primaryImg,
            `${primaryImg}&auto=format&fit=crop&w=800&q=60&sat=-50`,
            `${primaryImg}&auto=format&fit=crop&w=800&q=60&hue=180`,
            `${primaryImg}&auto=format&fit=crop&w=800&q=60&blur=2`,
          ]);
        }

        // Fetch recommendations
        try {
          const allVehiclesRes = await api.get<Vehicle[]>('/api/vehicles');
          if (allVehiclesRes && Array.isArray(allVehiclesRes.data)) {
            const similar = allVehiclesRes.data
              .filter(v => v.category.toLowerCase() === response.data.category.toLowerCase() && v.id !== id)
              .slice(0, 3);
            if (similar.length < 3) {
              const others = allVehiclesRes.data.filter(v => v.id !== id && !similar.some(s => s.id === v.id));
              similar.push(...others.slice(0, 3 - similar.length));
            }
            setRecommended(similar);
          }
        } catch (recErr) {
          console.error('Failed to load recommended vehicles:', recErr);
        }
      } catch (err: any) {
        console.error('Failed to load vehicle details', err);
        showToast('Vehicle not found', 'error');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicleDetails();
    }
  }, [id, navigate]);

  const handlePurchase = async () => {
    if (!user) {
      showToast('Please sign in to reserve this vehicle', 'warning');
      navigate('/login');
      return;
    }

    if (!vehicle || vehicle.quantity <= 0) {
      showToast('Vehicle is out of stock', 'error');
      return;
    }

    setShowConfirmation(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <DetailsSkeleton />
      </MainLayout>
    );
  }

  if (!vehicle) return null;

  const { variant, mileage, engine_capacity, color, descriptionText } = parseVehicleDescription(vehicle.description || null, vehicle.model, vehicle.image_url || null);
  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Back Button */}
        <div>
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column: Gallery, Description, Features, Specs, Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery Section */}
            <div className="space-y-6">
              <div className="h-[300px] sm:h-[450px] w-full rounded-3xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-sm">
                <img
                  src={activeImage}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover transition-all duration-300"
                />
              </div>
              
              {/* Thumbnails list */}
              <div className="grid grid-cols-4 gap-4">
                {thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(thumb)}
                    className={`h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all bg-white cursor-pointer ${
                      activeImage === thumb ? 'border-blue-600 scale-98 shadow-md' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`${vehicle.make} preview ${idx}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Description Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Detailed Description
              </h3>
              <p className="text-slate-600 leading-relaxed font-normal text-sm">
                {descriptionText ||
                  `The ${vehicle.year} ${vehicle.make} ${vehicle.model} delivers an exceptional combination of modern convenience, safety capabilities, and advanced performance characteristics. Categorized under the ${vehicle.category} segment, this vehicle comes fitted with a high-efficiency ${vehicle.fuel_type} drive layout and a responsive ${vehicle.transmission} gearbox, offering a premium and highly dynamic ride experience.`}
              </p>
            </div>

            {/* Vehicle Features Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Premium Features
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Apple CarPlay</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Keyless Entry</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Adaptive Cruise</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Lane Keep Assist</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Leather Seats</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Panoramic Roof</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm font-semibold">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Model Year</span>
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600/60" />
                    {vehicle.year}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Transmission</span>
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-blue-600/60" />
                    {vehicle.transmission}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Fuel Configuration</span>
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-blue-600/60" />
                    {vehicle.fuel_type}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Mileage</span>
                  <span className="text-slate-800">
                    {mileage > 0 ? `${mileage.toLocaleString()} km` : '0 km'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Engine Capacity</span>
                  <span className="text-slate-800">{engine_capacity}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Exterior Color</span>
                  <span className="text-slate-800">{color}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Category</span>
                  <span className="text-slate-800">{vehicle.category}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Availability</span>
                  <span className={`flex items-center gap-1.5 ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                    <CheckCircle className="h-4 w-4" />
                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Similar / Recommended Vehicles */}
            {recommended.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Recommended Vehicles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {recommended.map((item) => (
                    <VehicleCard
                      key={item.id}
                      vehicle={item}
                      onUpdate={(updated) => {
                        setRecommended(prev => prev.map(v => v.id === updated.id ? updated : v));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews Future Placeholder */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Customer Reviews
              </h3>
              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-4 first:pt-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">Verified Buyer</span>
                    <span className="text-[10px] text-slate-400">July 2026</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    "This vehicle exceeded all my expectations. Smooth ride quality and great assistance from the dealership."
                  </p>
                </div>
                <div className="pt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">Fleet Manager</span>
                    <span className="text-[10px] text-slate-400">June 2026</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    "Awesome additions to our corporate premium listings. Very simple reservation process."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Actions Sidebar */}
          <div className="lg:sticky lg:top-24 self-start space-y-6 w-full">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    {vehicle.category}
                  </span>
                  
                  <span className={`text-xs font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-slate-400'}`}>
                    {isOutOfStock ? 'Sold Out' : `${vehicle.quantity} Available`}
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight pt-1">
                  {vehicle.make} {vehicle.model}
                </h1>
                {variant && variant !== 'Standard' && (
                  <p className="text-xs font-semibold text-slate-500">
                    {variant}
                  </p>
                )}
                
                <p className="text-3xl font-extrabold text-blue-600 font-['Outfit'] pt-1">
                  ${vehicle.price.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <button
                  onClick={handlePurchase}
                  disabled={isOutOfStock}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-950 text-white hover:bg-slate-850 shadow-lg shadow-slate-900/10 font-extrabold'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? 'Out of Stock' : 'Reserve Vehicle'}
                </button>
                {!isOutOfStock && (
                  <button
                    onClick={() => setShowEmi(!showEmi)}
                    className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    {showEmi ? 'Hide EMI Calculator' : 'Calculate EMI'}
                  </button>
                )}
                {isOutOfStock && (
                  <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Admins can restock this item in the portal dashboard
                  </p>
                )}
              </div>
            </div>

            {/* EMI Calculator */}
            {showEmi && !isOutOfStock && (
              <div className="animate-fade-in-up">
                <EmiCalculator vehiclePrice={vehicle.price} />
              </div>
            )}
          </div>

        </div>

        <ReservationWizardModal
          vehicle={vehicle}
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onSuccess={async () => {
            // Fetch updated vehicle to reflect stock changes
            const updatedVehicleRes = await api.get<Vehicle>(`/api/vehicles/${vehicle.id}`);
            setVehicle(updatedVehicleRes.data);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default VehicleDetails;

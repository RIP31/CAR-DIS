import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCarImage } from '../components/VehicleCard';
import {
  ShoppingBag,
  Calendar,
  Layers,
  ChevronLeft,
  Fuel,
  Cpu,
  Info,
  CheckCircle,
  FileText,
  AlertTriangle,
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

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get<Vehicle>(`/api/vehicles/${id}`);
        setVehicle(response.data);
        const primaryImg = getCarImage(response.data.category, response.data.image_url);
        setActiveImage(primaryImg);

        setThumbnails([
          primaryImg,
          `${primaryImg}&auto=format&fit=crop&w=800&q=60&sat=-50`,
          `${primaryImg}&auto=format&fit=crop&w=800&q=60&hue=180`,
          `${primaryImg}&auto=format&fit=crop&w=800&q=60&blur=2`,
        ]);
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
      showToast('Please sign in to complete purchase', 'warning');
      navigate('/login');
      return;
    }

    if (!vehicle || vehicle.quantity <= 0) {
      showToast('Vehicle is out of stock', 'error');
      return;
    }

    try {
      const response = await api.post<Vehicle>(`/api/vehicles/${vehicle.id}/purchase`);
      setVehicle(response.data);
      showToast(`Congratulations! You have purchased the ${vehicle.make} ${vehicle.model}!`, 'success');

      const history = JSON.parse(localStorage.getItem('purchases') || '[]');
      history.push({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        price: vehicle.price,
        year: vehicle.year,
        date: new Date().toISOString(),
      });
      localStorage.setItem('purchases', JSON.stringify(history));
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Purchase transaction failed.';
      showToast(errorMsg, 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <DetailsSkeleton />
      </MainLayout>
    );
  }

  if (!vehicle) return null;

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
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-sm">
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
                  className={`h-20 rounded-xl overflow-hidden border-2 transition-all bg-white cursor-pointer ${
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

          {/* Right Column: Spec Sheet */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
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

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight pt-1">
                  {vehicle.make} {vehicle.model}
                </h1>
                
                <p className="text-3xl font-extrabold text-blue-600 font-['Outfit'] pt-1">
                  ${vehicle.price.toLocaleString()}
                </p>
              </div>

              {/* Specifications Table */}
              <div className="border-t border-slate-100 pt-5 space-y-4 text-sm font-semibold">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-600" />
                  Vehicle Properties
                </h3>

                <div className="space-y-3.5 pt-1">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-normal">Model Year</span>
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-600/60" />
                      {vehicle.year}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-normal">Transmission</span>
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-blue-600/60" />
                      {vehicle.transmission}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-normal">Fuel Configuration</span>
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <Fuel className="h-4 w-4 text-blue-600/60" />
                      {vehicle.fuel_type}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-normal">Registry Segment</span>
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-blue-600/60" />
                      {vehicle.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-normal">Availability</span>
                    <span className={`flex items-center gap-1.5 ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                      <CheckCircle className="h-4 w-4" />
                      {isOutOfStock ? 'Out of Stock' : 'In Stock Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Trigger Box */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <button
                  onClick={handlePurchase}
                  disabled={isOutOfStock}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 font-extrabold'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? 'Out of Stock' : 'Secure Purchase'}
                </button>
                {isOutOfStock && (
                  <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Admins can restock this item in the portal dashboard
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Detailed Description
          </h3>
          <p className="text-slate-600 leading-relaxed font-normal text-sm max-w-4xl">
            {vehicle.description ||
              `The ${vehicle.year} ${vehicle.make} ${vehicle.model} delivers an exceptional combination of modern convenience, safety capabilities, and advanced performance characteristics. Categorized under the ${vehicle.category} segment, this vehicle comes fitted with a high-efficiency ${vehicle.fuel_type} drive layout and a responsive ${vehicle.transmission} gearbox, offering a premium and highly dynamic ride experience. Feel free to contact our Detroit branch to query about custom logs and custom configurations.`}
          </p>
        </section>
      </div>
    </MainLayout>
  );
};

export default VehicleDetails;

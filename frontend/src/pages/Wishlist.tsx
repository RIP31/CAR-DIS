import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import type { Vehicle } from '../types';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistVehicles = async () => {
      if (!user || wishlistIds.size === 0) {
        setVehicles([]);
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<Vehicle[]>('/api/vehicles');
        const filtered = response.data.filter(v => wishlistIds.has(v.id));
        setVehicles(filtered);
      } catch (err) {
        console.error('Failed to fetch vehicles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistVehicles();
  }, [user, wishlistIds]);

  const handleUpdate = (updated: Vehicle) => {
    setVehicles(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const handleDelete = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500" />
            My Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {vehicles.length} saved vehicle{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Heart className="h-16 w-16 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-700">Your wishlist is empty</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Browse our showroom and tap the heart icon to save vehicles you love.
              </p>
            </div>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all border-none"
            >
              Explore Showroom
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Wishlist;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['SUV', 'Sedan', 'Coupe', 'Sports', 'Convertible', 'Truck', 'Hatchback', 'EV', 'Luxury'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'Semi-Automatic'];

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Sedan');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [year, setYear] = useState('2023');
  const [fuelType, setFuelType] = useState('Gasoline');
  const [transmission, setTransmission] = useState('Automatic');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await api.get<Vehicle>(`/api/vehicles/${id}`);
        const data = response.data;
        setMake(data.make);
        setModel(data.model);
        setCategory(data.category);
        setPrice(data.price.toString());
        setQuantity(data.quantity.toString());
        setYear(data.year.toString());
        setFuelType(data.fuel_type);
        setTransmission(data.transmission);
        setDescription(data.description || '');
        setImageUrl(data.image_url || '');
      } catch (err) {
        showToast('Failed to load vehicle details.', 'error');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchVehicle();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numPrice = Number(price);
    const numQty = Number(quantity);
    const numYear = Number(year);

    if (!make.trim() || !model.trim() || numPrice <= 0 || numQty < 0 || numYear < 1900) {
      showToast('Please check form fields validation. Ensure price is positive.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/api/vehicles/${id}`, {
        make: make.trim(),
        model: model.trim(),
        category,
        price: numPrice,
        quantity: numQty,
        year: numYear,
        fuel_type: fuelType,
        transmission,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      });

      showToast('Vehicle updated successfully!', 'success');
      navigate('/admin');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update vehicle attributes.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${make} ${model} forever?`)) {
      return;
    }
    try {
      await api.delete(`/api/vehicles/${id}`);
      showToast('Vehicle deleted successfully.', 'success');
      navigate('/admin');
    } catch (err) {
      showToast('Failed to delete vehicle.', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 min-h-screen">
        {/* Back Link */}
        <div className="flex justify-between items-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          {!loading && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-rose-600 hover:text-rose-700 transition-colors bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete Record
            </button>
          )}
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Modify Vehicle Details</h1>
          <p className="text-sm text-slate-500 mt-1">Edit specifications, pricing structure, and inventory quantity levels</p>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 flex items-center justify-center shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : (
          /* Form panel */
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Make */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Manufacturer (Make)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tesla"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
                />
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Model Variant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Model Y"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Segment Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Model Year</label>
                <input
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g. 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pricing ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g. 59900"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium animate-none"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Available Stock units</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
                />
              </div>

              {/* Fuel Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fuel configuration</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-semibold"
                >
                  {FUEL_TYPES.map((ft) => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gearbox Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-semibold"
                >
                  {TRANSMISSIONS.map((tr) => (
                    <option key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                Vehicle Image URL (optional)
              </label>
              <input
                type="url"
                placeholder="e.g. https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
              />
              <p className="text-[10px] text-slate-500">Leave blank to assign a beautiful dynamic category cover photograph automatically.</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description / details (optional)</label>
              <textarea
                placeholder="Describe styling highlights, specs, and status logs..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border-none disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Modifications'}
              </button>
              
              <Link
                to="/admin"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default EditVehicle;

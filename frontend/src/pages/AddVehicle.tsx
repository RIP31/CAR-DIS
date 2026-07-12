import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, Save, Image as ImageIcon } from 'lucide-react';

import { serializeVehicleDescription } from '../utils/vehicleHelper';

const CATEGORIES = ['SUV', 'Sedan', 'Coupe', 'Sports', 'Convertible', 'Luxury', 'Electric', 'Hatchback', 'Pickup'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual'];

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [category, setCategory] = useState('Sedan');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [year, setYear] = useState('2023');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [mileage, setMileage] = useState('');
  const [engineCapacity, setEngineCapacity] = useState('');
  const [color, setColor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numPrice = Number(price);
    const numQty = Number(quantity);
    const numYear = Number(year);
    const numMileage = Number(mileage) || 0;

    if (!make.trim() || !model.trim() || numPrice <= 0 || numQty < 0 || numYear < 1900 || numMileage < 0) {
      showToast('Please check form fields validation. Ensure price is positive.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse additional image URLs
      const imgArray = imageUrls.trim()
        ? imageUrls.split(',').map((u) => u.trim()).filter(Boolean)
        : [];
      if (imageUrl.trim()) {
        imgArray.unshift(imageUrl.trim());
      }

      // Serialize extra fields into the description string
      const serializedDescription = serializeVehicleDescription(
        variant.trim() || 'Standard',
        numMileage,
        engineCapacity.trim() || 'N/A',
        color.trim() || 'N/A',
        imgArray,
        description.trim()
      );

      await api.post('/api/vehicles', {
        make: make.trim(),
        model: model.trim(),
        category,
        price: numPrice,
        quantity: numQty,
        year: numYear,
        fuel_type: fuelType,
        transmission,
        description: serializedDescription,
        image_url: imgArray[0] || null,
      });

      showToast('Vehicle registered successfully!', 'success');
      navigate('/admin');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to register vehicle.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 min-h-screen">
        {/* Back Link */}
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register New Vehicle</h1>
          <p className="text-sm text-slate-500 mt-1">Insert detailed structural specs and inventory metadata</p>
        </div>

        {/* Form panel */}
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Model</label>
              <input
                type="text"
                required
                placeholder="e.g. Model Y"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Variant / Trim</label>
              <input
                type="text"
                placeholder="e.g. xDrive40i"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quantity in Stock</label>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fuel Type</label>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Transmission</label>
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

            {/* Mileage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mileage (km)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 15000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
              />
            </div>

            {/* Engine Capacity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Engine Capacity</label>
              <input
                type="text"
                placeholder="e.g. 3.0L / 2998 cc"
                value={engineCapacity}
                onChange={(e) => setEngineCapacity(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Exterior Color</label>
              <input
                type="text"
                placeholder="e.g. Alpine White"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
              />
            </div>

          </div>

          {/* Primary Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Primary Vehicle Image URL (optional)
            </label>
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
            />
          </div>

          {/* Additional Image URLs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Additional Image URLs (comma separated, optional)
            </label>
            <input
              type="text"
              placeholder="e.g. https://image1.com, https://image2.com"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-3 px-4 outline-none focus:border-blue-600/30 text-sm font-medium"
            />
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
              {isSubmitting ? 'Registering...' : 'Register Vehicle'}
            </button>
            
            <Link
              to="/admin"
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddVehicle;

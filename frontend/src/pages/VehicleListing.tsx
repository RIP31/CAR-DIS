import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import VehicleCard from '../components/VehicleCard';
import { ListingSkeleton } from '../components/LoadingSkeleton';
import { SlidersHorizontal, ArrowUpDown, X, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

import { parseVehicleDescription } from '../utils/vehicleHelper';

const CATEGORIES = ['SUV', 'Sedan', 'Coupe', 'Hatchback', 'EV', 'Luxury', 'Pickup'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Automatic', 'Manual'];

const VehicleListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sidebar Filter States (prefilled from URL if exists)
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [variant, setVariant] = useState(searchParams.get('variant') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuel_type') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [sortBy, setSortBy] = useState('newest'); // price_asc, price_desc, newest, oldest, latest

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Search input from home
  const searchQuery = searchParams.get('search') || '';

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (make) params.make = make;
      if (model) params.model = model;
      if (category) params.category = category;
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);
      if (year) params.year = Number(year);
      if (fuelType) params.fuel_type = fuelType;
      if (transmission) params.transmission = transmission;

      let response;
      if (Object.keys(params).length > 0 || searchQuery) {
        const queryParams = { ...params };
        if (searchQuery) {
          queryParams.model = searchQuery;
        }
        response = await api.get<Vehicle[]>('/api/vehicles/search', { params: queryParams });
        
        // Fallback to searching by make if empty
        if (response.data.length === 0 && searchQuery) {
          const altParams = { ...params, make: searchQuery };
          response = await api.get<Vehicle[]>('/api/vehicles/search', { params: altParams });
        }
      } else {
        response = await api.get<Vehicle[]>('/api/vehicles');
      }

      let data = response.data;

      // Local refinement: search query matching make, model, or variant
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        data = data.filter((v) => {
          const parsed = parseVehicleDescription(v.description, v.model, v.image_url);
          return (
            v.make.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            parsed.variant.toLowerCase().includes(query)
          );
        });
      }

      // Local refinement: Variant filter
      if (variant) {
        const variantQuery = variant.toLowerCase().trim();
        data = data.filter((v) => {
          const parsed = parseVehicleDescription(v.description, v.model, v.image_url);
          return parsed.variant.toLowerCase().includes(variantQuery);
        });
      }

      // Local refinement: Availability filter (In Stock Only)
      if (inStockOnly) {
        data = data.filter((v) => v.quantity > 0);
      }

      setVehicles(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [searchParams, make, model, variant, category, minPrice, maxPrice, year, fuelType, transmission, inStockOnly]);

  // Handle Sort
  const getSortedVehicles = () => {
    const list = [...vehicles];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'year_desc':
      case 'newest':
        return list.sort((a, b) => b.year - a.year);
      case 'year_asc':
      case 'oldest':
        return list.sort((a, b) => a.year - b.year);
      case 'latest':
        // Sort by id / created_at descending (latest added first)
        return list.sort((a, b) => b.id.localeCompare(a.id));
      default:
        return list.sort((a, b) => a.make.localeCompare(b.make));
    }
  };

  const sortedVehicles = getSortedVehicles();

  // Paginate list
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const paginatedVehicles = sortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setMake('');
    setModel('');
    setVariant('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setYear('');
    setFuelType('');
    setTransmission('');
    setInStockOnly(false);
    setSearchParams({});
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vehicle Showroom</h1>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery
                ? `Search results for "${searchQuery}" • ${sortedVehicles.length} vehicles found`
                : `${sortedVehicles.length} premium vehicles registered in stock`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
            {/* View Mode controls */}
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent ${
                  viewMode === 'grid' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent ${
                  viewMode === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-700">
              <ArrowUpDown className="h-4 w-4 text-blue-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 outline-none border-none cursor-pointer pr-4"
              >
                <option value="latest">Latest Added</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest Model Year</option>
                <option value="oldest">Oldest Model Year</option>
              </select>
            </div>

            {/* Mobile Filter toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-slate-800"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Sidebar & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* 1. Left Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 space-y-6 sticky top-24 max-h-[85vh] overflow-y-auto shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase text-slate-900 tracking-widest flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                Refine Search
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[10px] uppercase font-bold text-slate-500 hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Filters Form */}
            <div className="space-y-4 text-sm">
              {/* Make Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer (Make)</label>
                <input
                  type="text"
                  placeholder="e.g. BMW"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm"
                />
              </div>

              {/* Model Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model</label>
                <input
                  type="text"
                  placeholder="e.g. X5"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm"
                />
              </div>

              {/* Variant Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variant / Trim</label>
                <input
                  type="text"
                  placeholder="e.g. xDrive40i"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm font-semibold"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing Range ($)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm w-full"
                  />
                </div>
              </div>

              {/* Year Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2023"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm"
                />
              </div>

              {/* Fuel Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm font-semibold"
                >
                  <option value="">All Fuel Types</option>
                  {FUEL_TYPES.map((ft) => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2 px-3 outline-none focus:border-blue-600/30 text-sm font-semibold"
                >
                  <option value="">All Transmissions</option>
                  {TRANSMISSIONS.map((tr) => (
                    <option key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>

              {/* AvailabilityCheckbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="inStockOnly"
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="inStockOnly" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  In Stock Only
                </label>
              </div>
            </div>
          </aside>

          {/* 2. Right Catalog Listing */}
          <section className="lg:col-span-3 space-y-8">
            {loading ? (
              <ListingSkeleton />
            ) : paginatedVehicles.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">No Matching Vehicles</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  We couldn't find any vehicles in our database matching your current criteria. Try loosening your filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider border-none cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'flex flex-col gap-5'
                  }
                >
                  {paginatedVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={viewMode === 'list' ? 'h-auto sm:h-52 w-full flex flex-col sm:flex-row' : ''}
                    >
                      <VehicleCard
                        vehicle={vehicle}
                        onUpdate={handleUpdateVehicle}
                        onDelete={handleDeleteVehicle}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-200 hover:border-blue-500/30 hover:bg-slate-50 rounded-xl disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent cursor-pointer bg-white text-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`h-9 w-9 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/10'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-slate-200 hover:border-blue-500/30 hover:bg-slate-50 rounded-xl disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent cursor-pointer bg-white text-slate-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* 3. Mobile Filters Slide-out Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden animate-fade-in-up">
          <div
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between z-10 overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                  Filter Options
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-slate-400 hover:text-slate-900 cursor-pointer border-none bg-transparent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filters Form */}
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Make</label>
                  <input
                    type="text"
                    placeholder="e.g. BMW"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm focus:border-blue-600/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. X5"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm focus:border-blue-600/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variant / Trim</label>
                  <input
                    type="text"
                    placeholder="e.g. xDrive40i"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm focus:border-blue-600/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm font-semibold focus:border-blue-600/30"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Range ($)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm w-full focus:border-blue-600/30"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm w-full focus:border-blue-600/30"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2023"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm focus:border-blue-600/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm font-semibold focus:border-blue-600/30"
                  >
                    <option value="">All Fuel Types</option>
                    {FUEL_TYPES.map((ft) => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-950 rounded-xl py-2.5 px-4 outline-none text-sm font-semibold focus:border-blue-600/30"
                  >
                    <option value="">All Transmissions</option>
                    {TRANSMISSIONS.map((tr) => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="inStockOnlyMobile"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="inStockOnlyMobile" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    In Stock Only
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider border-none cursor-pointer hover:bg-slate-800"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default VehicleListing;

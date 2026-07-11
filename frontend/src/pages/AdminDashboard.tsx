import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle } from '../types';
import MainLayout from '../layouts/MainLayout';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  DollarSign,
  Layers,
  Car,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get<Vehicle[]>('/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRestock = async (id: string) => {
    try {
      const response = await api.post<Vehicle>(`/api/vehicles/${id}/restock?quantity=10`);
      setVehicles((prev) => prev.map((v) => (v.id === id ? response.data : v)));
      showToast('Successfully restocked 10 units!', 'success');
    } catch (err) {
      showToast('Restock failed.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from the database?`)) {
      return;
    }
    try {
      await api.delete(`/api/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      showToast('Vehicle deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete vehicle.', 'error');
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFleetValuation = vehicles.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalPhysicalStock = vehicles.reduce((acc, curr) => acc + curr.quantity, 0);
  const outOfStockModels = vehicles.filter((v) => v.quantity <= 0).length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time stock control registry and valuation stats</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadDashboardData}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Refresh inventory"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              to="/admin/add-vehicle"
              className="bg-teal-500 hover:bg-teal-400 text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-none shadow-lg shadow-teal-500/10"
            >
              <Plus className="h-4 w-4 shrink-0" />
              Add Fleet Vehicle
            </Link>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between bg-[#0d0e12]/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Valuation</span>
                  <span className="text-2xl font-extrabold text-white block font-['Outfit']">
                    ${totalFleetValuation.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/10">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between bg-[#0d0e12]/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Physical Stock</span>
                  <span className="text-2xl font-extrabold text-white block font-['Outfit']">
                    {totalPhysicalStock} Units
                  </span>
                </div>
                <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/10">
                  <Car className="h-5 w-5" />
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between bg-[#0d0e12]/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Out of Stock</span>
                  <span className={`text-2xl font-extrabold block font-['Outfit'] ${outOfStockModels > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {outOfStockModels} Models
                  </span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/10">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Registry Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/5 bg-[#0d0e12]/30">
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-tight">Fleet Registrations Registry</h3>
                
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by make, model, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500/30"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-4 px-6">Model Attributes</th>
                      <th className="py-4 px-6">Segment</th>
                      <th className="py-4 px-6">Specifications</th>
                      <th className="py-4 px-6">Valuation</th>
                      <th className="py-4 px-6">Availability</th>
                      <th className="py-4 px-6 text-right">Registry Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 font-normal">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-4 px-6">
                            <span className="text-white block font-bold">{vehicle.make} {vehicle.model}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{vehicle.year}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-400 font-semibold">
                              {vehicle.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-normal">
                            <span>{vehicle.fuel_type}</span> • <span>{vehicle.transmission}</span>
                          </td>
                          <td className="py-4 px-6 font-['Outfit'] text-white font-bold">
                            ${vehicle.price.toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-xs ${vehicle.quantity <= 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                              {vehicle.quantity <= 0 ? 'Out of Stock' : `${vehicle.quantity} Units`}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 shrink-0">
                            <button
                              onClick={() => handleRestock(vehicle.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Add 10 units"
                            >
                              Restock (+10)
                            </button>
                            
                            <Link
                              to={`/admin/edit-vehicle/${vehicle.id}`}
                              className="inline-flex p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all"
                              title="Edit Attributes"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>

                            <button
                              onClick={() => handleDelete(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/10 transition-all cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

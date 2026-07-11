import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { AlertCircle, ArrowLeft, Home as HomeIcon } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-xl mx-auto px-6 text-center space-y-6 select-none animate-fade-in-up">
        {/* Glow Element */}
        <div className="h-[250px] w-[250px] bg-rose-500/10 blur-[80px] rounded-full absolute z-0 pointer-events-none" />

        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl z-10">
          <AlertCircle className="h-12 w-12" />
        </div>

        <div className="space-y-2 z-10">
          <h1 className="text-7xl font-extrabold text-white tracking-tighter font-['Outfit'] leading-none">404</h1>
          <h2 className="text-xl font-bold text-slate-200 tracking-tight">Wrong Turn. Out of Gas.</h2>
          <p className="text-slate-500 text-sm font-normal max-w-sm mx-auto leading-relaxed">
            The page you are looking for has been moved, deleted, or never existed in our physical inventory registry database.
          </p>
        </div>

        <div className="flex gap-4 pt-4 z-10">
          <Link
            to="/"
            className="bg-white hover:bg-slate-200 text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border-none shadow-lg shadow-white/5"
          >
            <HomeIcon className="h-4 w-4" />
            Home Catalog
          </Link>
          <Link
            to="/vehicles"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;

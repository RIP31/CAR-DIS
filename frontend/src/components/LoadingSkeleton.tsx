import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full border border-white/5 bg-[#121418]/40">
      <div className="h-48 w-full animate-shimmer" />
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded animate-shimmer" />
          <div className="h-6 w-3/4 rounded animate-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full animate-shimmer" />
          <div className="h-5 w-16 rounded-full animate-shimmer" />
          <div className="h-5 w-16 rounded-full animate-shimmer" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-24 rounded animate-shimmer" />
          <div className="h-4 w-16 rounded animate-shimmer" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-10 flex-1 rounded-xl animate-shimmer" />
          <div className="h-10 w-24 rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const ListingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Image Gallery and Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="h-[450px] w-full rounded-3xl animate-shimmer" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="space-y-4 pt-6">
          <div className="h-8 w-1/3 rounded animate-shimmer" />
          <div className="h-4 w-full rounded animate-shimmer" />
          <div className="h-4 w-5/6 rounded animate-shimmer" />
          <div className="h-4 w-4/5 rounded animate-shimmer" />
        </div>
      </div>

      {/* Sidebar Spec Sheet */}
      <div className="space-y-6">
        <div className="glass p-8 rounded-3xl space-y-6 border border-white/5 bg-[#121418]/60">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded animate-shimmer" />
            <div className="h-8 w-1/2 rounded animate-shimmer" />
          </div>
          <div className="border-t border-white/5 pt-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 rounded animate-shimmer" />
                <div className="h-4 w-32 rounded animate-shimmer" />
              </div>
            ))}
          </div>
          <div className="pt-6">
            <div className="h-12 w-full rounded-2xl animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass p-6 rounded-2xl space-y-3">
            <div className="h-4 w-24 rounded animate-shimmer" />
            <div className="h-8 w-32 rounded animate-shimmer" />
          </div>
        ))}
      </div>
      {/* Table grid */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5 bg-[#121418]/30">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="h-6 w-48 rounded animate-shimmer" />
          <div className="h-10 w-32 rounded-xl animate-shimmer" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-xl animate-shimmer" />
              <div className="h-8 flex-1 rounded animate-shimmer" />
              <div className="h-8 w-24 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

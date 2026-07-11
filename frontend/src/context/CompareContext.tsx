import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Vehicle } from '../types';

interface CompareContextType {
  compareList: Vehicle[];
  addToCompare: (vehicle: Vehicle) => boolean;
  removeFromCompare: (vehicleId: string) => void;
  isInCompare: (vehicleId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Vehicle[]>([]);

  const addToCompare = useCallback((vehicle: Vehicle): boolean => {
    let added = false;
    setCompareList(prev => {
      if (prev.length >= 3) return prev;
      if (prev.find(v => v.id === vehicle.id)) return prev;
      added = true;
      return [...prev, vehicle];
    });
    return added;
  }, []);

  const removeFromCompare = useCallback((vehicleId: string) => {
    setCompareList(prev => prev.filter(v => v.id !== vehicleId));
  }, []);

  const isInCompare = useCallback((vehicleId: string) => {
    return compareList.some(v => v.id === vehicleId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#08090a] text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <Navbar />
      <main className="flex-1 w-full pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

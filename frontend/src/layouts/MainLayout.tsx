import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1e293b] selection:bg-blue-500/10 selection:text-blue-600">
      <Navbar />
      <main className="flex-1 w-full pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

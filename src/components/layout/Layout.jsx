import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-white/5 blur-[100px] rounded-full"></div>
      </div>

      <Navbar />
      <main className="flex-grow z-10 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

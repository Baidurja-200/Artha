import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Activity, PieChart, Calculator, ShieldAlert, LineChart, TrendingUp, CreditCard } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Activity size={18} /> },
    { name: 'Credit Health', path: '/credit-health', icon: <CreditCard size={18} /> },
    { name: 'Calculators', path: '/calculators', icon: <Calculator size={18} /> },
    { name: 'Tax', path: '/tax-planning', icon: <LineChart size={18} /> },
    { name: 'Portfolio', path: '/portfolio-analysis', icon: <TrendingUp size={18} /> },
    { name: 'Mutual Funds', path: '/mutual-funds', icon: <PieChart size={18} /> },
    { name: 'Risk Profile', path: '/risk', icon: <ShieldAlert size={18} /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/80 backdrop-blur-lg border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all duration-300">
              <span className="text-dark-900 font-bold font-display text-xl">A</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-gold-400 transition-colors">Artha<span className="text-gold-500">.</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.path) 
                    ? 'bg-white/10 text-gold-400' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/profile" className="text-gray-300 hover:text-gold-400 text-sm font-medium transition-colors">
              My Profile
            </Link>
            <a 
              href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary py-2 px-5 text-sm flex items-center gap-2"
            >
              Chat with Artha <ChevronRight size={16} />
            </a>
          </div>

          <button 
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-dark-800/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'}`}>
        <div className="flex flex-col px-6 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isActive(link.path) ? 'bg-gold-500/10 text-gold-400' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
          <div className="h-px w-full bg-white/10 my-2"></div>
          <Link 
            to="/profile" 
            onClick={() => setIsOpen(false)}
            className="p-3 text-gray-300 font-medium hover:text-gold-400"
          >
            My Profile
          </Link>
          <a 
             href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha" 
             target="_blank" 
             rel="noopener noreferrer"
             className="btn-primary flex justify-center mt-2"
             onClick={() => setIsOpen(false)}
          >
            Chat with Artha
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-white/5 pt-16 pb-8 relative z-10 mt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                <span className="text-dark-900 font-bold font-display text-xl">A</span>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">Artha<span className="text-gold-500">.</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium financial planning, portfolio analysis, and intelligent investing guidance built specifically for Indian retail investors.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/calculators" className="hover:text-gold-400 transition-colors">SIP Calculator</Link></li>
              <li><Link to="/calculators" className="hover:text-gold-400 transition-colors">EMI Calculator</Link></li>
              <li><Link to="/tax" className="hover:text-gold-400 transition-colors">Tax Calculator (New vs Old)</Link></li>
              <li><Link to="/calculators" className="hover:text-gold-400 transition-colors">Retirement Planner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-gold-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/portfolio" className="hover:text-gold-400 transition-colors">Portfolio Analyzer</Link></li>
              <li><Link to="/risk" className="hover:text-gold-400 transition-colors">Risk Profiler</Link></li>
              <li><Link to="/profile" className="hover:text-gold-400 transition-colors">Financial Wellness</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                  Chat with Artha AI <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </a>
              </li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Artha Financial. All rights reserved. Not actual financial advice.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

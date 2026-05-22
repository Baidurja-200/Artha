import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, Receipt, PiggyBank, Target, Lightbulb, History, CreditCard, Sparkles } from 'lucide-react';

interface SubNavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const SubNav = () => {
  const location = useLocation();

  const links: SubNavLink[] = [
    { name: 'Health Engine', path: '/financial-health', icon: <HeartPulse size={16} /> },
    { name: 'Credit Health', path: '/credit-health', icon: <CreditCard size={16} /> },
    { name: 'AI Assistant', path: '/assistant', icon: <Sparkles size={16} /> },
    { name: 'Expense Engine', path: '/expense-analysis', icon: <Receipt size={16} /> },
    { name: 'Cash Flow', path: '/cash-flow', icon: <PiggyBank size={16} /> },
    { name: 'Budget Assistant', path: '/budgeting', icon: <Target size={16} /> },
    { name: 'Decision Insights', path: '/insights', icon: <Lightbulb size={16} /> },
    { name: 'Progress Tracking', path: '/tracking', icon: <History size={16} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      role="navigation" 
      aria-label="Financial Intelligence Navigation"
      className="w-full bg-dark-900/60 backdrop-blur-md border-b border-white/5 sticky top-[72px] z-40 py-3 overflow-x-auto scrollbar-hide"
    >
      <div className="container mx-auto px-6 max-w-7xl flex gap-3 md:gap-4 items-center justify-start md:justify-center">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            aria-current={isActive(link.path) ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isActive(link.path)
                ? 'bg-gradient-gold text-dark-900 font-semibold shadow-gold'
                : 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SubNav;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, PieChart, Calculator } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Calculator className="w-8 h-8 text-gold-400" />,
      title: 'Smart Calculators',
      description: 'Advanced SIP, EMI, and Retirement calculators tailored for Indian markets and inflation.'
    },
    {
      icon: <PieChart className="w-8 h-8 text-gold-400" />,
      title: 'Portfolio Analysis',
      description: 'Deep dive into your sector allocation, concentration risk, and estimated volatility.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-gold-400" />,
      title: 'Indian Market Data',
      description: 'Live updates on NIFTY 50, SENSEX, and top movers to keep you informed.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-gold-400" />,
      title: 'Financial Wellness',
      description: 'Get a comprehensive score based on your savings, emergency fund, and debt ratio.'
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center pt-20 pb-32 overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-5xl text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 backdrop-blur-sm animate-fade-in">
            <span className="text-gold-400 text-sm font-medium tracking-wide uppercase">For Indian Retail Investors</span>
          </div>
          
          <h1 className="heading-1 mb-8 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Understand your money <br/>
            <span className="text-gradient-gold">before investing it.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Financial planning, portfolio analysis, tax tools, and intelligent investing guidance built specifically for Indian investors.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <a 
              href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Chat with Artha <ArrowRight size={20} />
            </a>
            <Link to="/dashboard" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
              Explore Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-dark-900/50 backdrop-blur-sm border-y border-white/5 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Intelligent Wealth Management</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to analyze, plan, and grow your wealth in the Indian market.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-dark-700/50 flex items-center justify-center mb-6 border border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Premium CTA */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-900/10 to-transparent"></div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <h2 className="heading-2 mb-6">Ready to take control?</h2>
          <p className="text-gray-400 mb-10 text-lg">Build your profile today and get a personalized financial wellness score.</p>
          <Link to="/profile" className="btn-primary inline-flex items-center gap-2">
            Build My Profile <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

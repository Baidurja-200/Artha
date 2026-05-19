import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, PieChart, Calculator, BookOpen } from 'lucide-react';
import SEO from '../components/common/SEO';
import FinanceNews from '../components/dashboard/FinanceNews';

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
    <main 
      className="flex flex-col min-h-[calc(100vh-80px)] bg-dark-950 text-white relative overflow-hidden"
      role="main"
      data-home-features={JSON.stringify(features.map(f => ({ title: f.title, description: f.description })))}
    >
      <SEO 
        title="Understand Your Wealth"
        description="Artha is a Personal Financial Health & Decision Intelligence Platform for Indian retail investors. Access tax calculators, SIP projections, and risk analysis tools."
        keywords="personal finance India, wealth planning, direct mutual funds, portfolio analysis, SIP calculator, tax old vs new regime"
      />

      {/* Premium Layered Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Fintech grid texture with vignette mask */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(212, 175, 55, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 175, 55, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(circle at 50% 30%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 20%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        {/* Ambient radial glows (soft gold, amber, champagne, soft white) */}
        {/* Top-Right Glow (warm gold / champagne) */}
        <div 
          className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] max-w-[700px] rounded-full opacity-[0.09] blur-[130px] animate-drift-1"
          style={{
            background: 'radial-gradient(circle, rgba(214, 175, 55, 0.5) 0%, rgba(244, 224, 118, 0.2) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Center/Behind Hero Cards Glow (champagne / soft white) */}
        <div 
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] max-w-[600px] rounded-full opacity-[0.06] blur-[120px] animate-drift-3"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(244, 224, 118, 0.1) 60%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Bottom-Left Accent (amber / muted gold) */}
        <div 
          className="absolute bottom-[15%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] rounded-full opacity-[0.08] blur-[140px] animate-drift-2"
          style={{
            background: 'radial-gradient(circle, rgba(214, 175, 55, 0.4) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Additional very soft ambient bottom-right glow */}
        <div 
          className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] max-w-[500px] rounded-full opacity-[0.05] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(214, 175, 55, 0.3) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center pt-20 pb-32 overflow-hidden" aria-label="Artha Introduction Hero">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" aria-hidden="true"></div>
        
        <header className="container mx-auto px-6 relative z-10 max-w-5xl text-center space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 backdrop-blur-sm animate-fade-in">
            <span className="text-gold-400 text-sm font-medium tracking-wide uppercase">For Indian Retail Investors</span>
          </div>
          
          <h1 className="heading-1 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Understand your money <br/>
            <span className="text-gradient-gold">before investing it.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Financial planning, portfolio analysis, tax tools, and intelligent investing guidance built specifically for Indian investors.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <a 
              href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4"
              aria-label="Start AI conversation with Artha chatbot assistant (opens in a new tab)"
            >
              Chat with Artha <ArrowRight size={20} aria-hidden="true" />
            </a>
            <Link 
              to="/dashboard" 
              className="btn-secondary w-full sm:w-auto text-lg px-8 py-4"
              aria-label="Explore financial suite tools and dashboard"
            >
              Explore Tools
            </Link>
          </div>
        </header>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-dark-900/50 backdrop-blur-sm border-y border-white/5 relative z-10" aria-label="Artha Intelligent Features">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Intelligent Wealth Management</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to analyze, plan, and grow your wealth in the Indian market.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <article key={index} className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-start">
                <div className="w-14 h-14 rounded-2xl bg-dark-700/50 flex items-center justify-center mb-6 border border-white/5" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Static Educational Guide Section */}
      <section className="py-20 bg-dark-950 relative z-10 border-b border-white/5" aria-label="Indian Financial Philosophy Guide">
        <div className="container mx-auto px-6 max-w-7xl space-y-10">
          <div className="text-center">
            <h2 className="heading-2 flex items-center justify-center gap-2">
              <BookOpen className="text-gold-400" /> Foundations of Retail Wealth Building
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-2">
              Understand the core tenets of systematic Indian personal finance before deploying capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-white">1. Defining Your Risk Baseline First</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Many retail investors deploy capital in high-beta equity funds only to panic during a standard market correction. Correct financial planning dictates auditing your **risk profile index** before choosing allocations, ensuring your asset structures match your emotional capacity and timeline constraints.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-white">2. Minimizing Structural Tax Drags</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Taxes are a structural drag on wealth compounding. Utilizing direct tax shields like Section 80C (PPF, ELSS mutual funds), Section 80D medical covers, and HRA rent optimization is equivalent to earning a guaranteed, risk-free return of **up to 30%** (for high slab earners) on saved capital.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-white">3. Compounding systematically (SIP)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Market timing is a statistical losing game for retail investors. Capital growth compounding is maximized by automating **Systematic Investment Plans (SIPs)**, which dollar-cost-average (rupee-cost-average) market volatile peaks and troughs, converting short-term volatility into long-term wealth stability.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Live Finance News Feed */}
      <section className="py-16 bg-dark-900/30 border-b border-white/5 relative z-10" aria-label="Live Market News">
        <div className="container mx-auto px-6 max-w-7xl">
          <FinanceNews />
        </div>
      </section>
      
      {/* Premium CTA */}
      <section className="py-24 relative z-10 overflow-hidden" aria-label="Get Started Call-To-Action">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-900/10 to-transparent" aria-hidden="true"></div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10 space-y-6">
          <h2 className="heading-2">Ready to take control of your financial destiny?</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Build your profile today, analyze your savings safety buffers, and unlock your financial wellness score.</p>
          <Link 
            to="/profile" 
            className="btn-primary inline-flex items-center gap-2"
            aria-label="Navigate to build your investor profile and save details"
          >
            Build My Profile <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;

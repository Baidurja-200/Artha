import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  schemaType?: 'SoftwareApplication' | 'FinancialService' | 'Organization' | 'WebApplication' | 'FAQPage';
  schemaData?: Record<string, any>;
}

export const SEO = ({ 
  title, 
  description, 
  keywords = 'artha, finance tracker, mutual funds, personal finance, wealth compounding, tax saver, budget planner, Indian investor, financial health, SIP calculator', 
  path = '',
  schemaType = 'WebApplication',
  schemaData = {}
}: SEOProps) => {
  useEffect(() => {
    // 1. Update document title
    const fullTitle = `Artha | ${title}`;
    document.title = fullTitle;

    // 2. Helper to set meta attributes
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Inject core meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    
    // 4. Inject Open Graph Meta tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', `https://artha.app${path}`, true);
    setMetaTag('og:site_name', 'Artha Financial platform', true);

    // 5. Inject Twitter Card Meta tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);

    // 6. Generate JSON-LD Schema
    const baseSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      'name': `Artha - ${title}`,
      'description': description,
      'url': `https://artha.app${path}`,
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'Windows, MacOS, iOS, Android',
    };

    if (schemaType === 'WebApplication' || schemaType === 'SoftwareApplication') {
      baseSchema.browserRequirements = 'Requires HTML5, WebGL, and JavaScript capabilities.';
      baseSchema.softwareVersion = '2.1.0';
      baseSchema.screenshot = 'https://artha.app/assets/screenshot_luxury_dashboard.png';
      baseSchema.offers = {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'INR',
        'category': 'Free'
      };
      baseSchema.featureList = [
        'Interactive Financial Health Scores',
        'Rule-based Auto-categorizing CSV Expense Import',
        'Capital Cashflow Runway Simulator',
        'Compounding Milestone Goal Planner',
        'Decision Priority Stack Generator',
        'Topical Financial Wellness Guides'
      ];
    }

    // Merge custom schema details
    const finalSchema = { ...baseSchema, ...schemaData };

    // Find or create JSON-LD script block
    let scriptElement = document.head.querySelector('script[type="application/ld+json"]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(finalSchema, null, 2);

    return () => {
      // Optional: clean up schema script tag if page unmounts
      // We keep it so crawlers always see a fallback schema.
    };
  }, [title, description, keywords, path, schemaType, schemaData]);

  return null;
};

export default SEO;

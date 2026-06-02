const BASE_URL = 'https://api.mfapi.in/mf';

/**
 * Service to interact with the Indian Mutual Fund API (mfapi.in)
 */
export const mutualFundService = {
  /**
   * Fetch all mutual fund schemes (Master List)
   * Note: This returns thousands of records. In a real app, this should be cached or paginated.
   */
  getAllSchemes: async () => {
    try {
      const response = await fetch(`${BASE_URL}`);
      if (!response.ok) throw new Error('Failed to fetch mutual fund schemes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw error;
    }
  },

  /**
   * Search for mutual funds by name
   */
  searchSchemes: async (query) => {
    try {
      // The API has a search endpoint: /search?q=query
      const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search schemes');
      return await response.json();
    } catch (error) {
      console.error('Error searching schemes:', error);
      throw error;
    }
  },

  /**
   * Fetch detailed historical data for a specific scheme code
   */
  getSchemeDetails: async (schemeCode) => {
    try {
      const response = await fetch(`${BASE_URL}/${schemeCode}`);
      if (!response.ok) throw new Error('Failed to fetch scheme details');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching details for scheme ${schemeCode}:`, error);
      throw error;
    }
  },

  /**
   * Calculate derived metrics (like 1Y, 3Y returns) from historical NAV data
   * This is a utility function applied after fetching details
   */
  calculateReturns: (navData) => {
    if (!navData || navData.length < 2) return null;
    
    // Sort data chronologically (API usually returns newest first, but ensuring order)
    const sortedData = [...navData].sort((a, b) => {
      const dateA = new Date(a.date.split('-').reverse().join('-'));
      const dateB = new Date(b.date.split('-').reverse().join('-'));
      return dateB - dateA; // Descending (newest first)
    });

    const currentNav = parseFloat(sortedData[0].nav);
    
    // Helper to find closest date NAV
    const getHistoricalNav = (yearsAgo) => {
      const targetDate = new Date(sortedData[0].date.split('-').reverse().join('-'));
      targetDate.setFullYear(targetDate.getFullYear() - yearsAgo);
      
      const closest = sortedData.reduce((prev, curr) => {
        const currDate = new Date(curr.date.split('-').reverse().join('-'));
        const prevDate = new Date(prev.date.split('-').reverse().join('-'));
        return Math.abs(currDate - targetDate) < Math.abs(prevDate - targetDate) ? curr : prev;
      });
      return parseFloat(closest.nav);
    };

    try {
      const nav1Y = getHistoricalNav(1);
      const nav3Y = getHistoricalNav(3);
      const nav5Y = getHistoricalNav(5);

      const return1Y = ((currentNav - nav1Y) / nav1Y) * 100;
      const cagr3Y = (Math.pow(currentNav / nav3Y, 1/3) - 1) * 100;
      const cagr5Y = (Math.pow(currentNav / nav5Y, 1/5) - 1) * 100;

      return {
        currentNav,
        return1Y: return1Y.toFixed(2),
        cagr3Y: cagr3Y.toFixed(2),
        cagr5Y: cagr5Y.toFixed(2)
      };
    } catch (e) {
      return { currentNav, return1Y: 'N/A', cagr3Y: 'N/A', cagr5Y: 'N/A' };
    }
  }
};

// --- MOCK DATA FOR FALLBACK / ENHANCED UI ---
// The free API doesn't provide Expense Ratio, AUM, Risk level, or Category out of the box.
// In a production app, this would be stitched from a premium API (like Morningstar).
// We use mock mappings to create the premium analytical feel requested.

export const POPULAR_FUNDS = {
  indexFunds: [
    { schemeCode: '119827', schemeName: 'SBI Nifty 50 Index Fund Direct Growth', category: 'Index Funds', risk: 'Very High', expenseRatio: 0.20, aum: '45,000 Cr', manager: 'Ravi Kumar', minSip: 500, type: 'Equity' },
    { schemeCode: '120716', schemeName: 'UTI Nifty 50 Index Fund Direct Growth', category: 'Index Funds', risk: 'Very High', expenseRatio: 0.21, aum: '12,500 Cr', manager: 'Sharwan Goyal', minSip: 500, type: 'Equity' },
    { schemeCode: '119063', schemeName: 'HDFC Index Fund Nifty 50 Plan Direct Growth', category: 'Index Funds', risk: 'Very High', expenseRatio: 0.20, aum: '8,000 Cr', manager: 'Krishan Daga', minSip: 100, type: 'Equity' }
  ],
  flexiCap: [
    { schemeCode: '122639', schemeName: 'Parag Parikh Flexi Cap Fund Direct Growth', category: 'Flexi Cap', risk: 'High', expenseRatio: 0.75, aum: '60,000 Cr', manager: 'Rajeev Thakkar', minSip: 1000, type: 'Equity' },
    { schemeCode: '118955', schemeName: 'HDFC Flexi Cap Fund Direct Growth', category: 'Flexi Cap', risk: 'High', expenseRatio: 0.85, aum: '45,000 Cr', manager: 'Roshi Jain', minSip: 500, type: 'Equity' },
    { schemeCode: '119718', schemeName: 'SBI Flexi Cap Fund Direct Growth', category: 'Flexi Cap', risk: 'High', expenseRatio: 0.80, aum: '18,000 Cr', manager: 'R Srinivasan', minSip: 500, type: 'Equity' }
  ],
  largeCap: [
    { schemeCode: '120465', schemeName: 'Axis Bluechip Fund Direct Growth', category: 'Large Cap', risk: 'High', expenseRatio: 0.90, aum: '33,000 Cr', manager: 'Shreyash Devalkar', minSip: 500, type: 'Equity' },
    { schemeCode: '120586', schemeName: 'ICICI Prudential Bluechip Fund Direct Growth', category: 'Large Cap', risk: 'High', expenseRatio: 0.95, aum: '42,000 Cr', manager: 'Anish Tawakley', minSip: 100, type: 'Equity' },
    { schemeCode: '118825', schemeName: 'Mirae Asset Large Cap Fund Direct Growth', category: 'Large Cap', risk: 'High', expenseRatio: 0.55, aum: '35,000 Cr', manager: 'Gaurav Misra', minSip: 1000, type: 'Equity' }
  ],
  midCap: [
    { schemeCode: '127042', schemeName: 'Motilal Oswal Midcap Fund Direct Growth', category: 'Mid Cap', risk: 'Very High', expenseRatio: 0.65, aum: '8,000 Cr', manager: 'Niket Shah', minSip: 500, type: 'Equity' },
    { schemeCode: '119775', schemeName: 'Kotak Emerging Equity Fund Direct Growth', category: 'Mid Cap', risk: 'Very High', expenseRatio: 0.45, aum: '35,000 Cr', manager: 'Pankaj Tibrewal', minSip: 1000, type: 'Equity' }
  ],
  smallCap: [
    { schemeCode: '118778', schemeName: 'Nippon India Small Cap Fund Direct Growth', category: 'Small Cap', risk: 'Very High', expenseRatio: 0.69, aum: '45,000 Cr', manager: 'Samir Rachh', minSip: 100, type: 'Equity' },
    { schemeCode: '120828', schemeName: 'Quant Small Cap Fund Direct Growth', category: 'Small Cap', risk: 'Very High', expenseRatio: 0.77, aum: '15,000 Cr', manager: 'Ankit Pande', minSip: 1000, type: 'Equity' }
  ],
  taxSaving: [
    { schemeCode: '135781', schemeName: 'Mirae Asset Tax Saver Fund Direct Growth', category: 'ELSS', risk: 'High', expenseRatio: 0.60, aum: '19,000 Cr', manager: 'Neelesh Surana', minSip: 500, type: 'Equity' },
    { schemeCode: '120847', schemeName: 'Quant Tax Plan Direct Growth', category: 'ELSS', risk: 'High', expenseRatio: 0.77, aum: '6,500 Cr', manager: 'Ankit Pande', minSip: 500, type: 'Equity' }
  ],
  debtFunds: [
    { schemeCode: '119800', schemeName: 'SBI Liquid Fund Direct Growth', category: 'Debt Funds', risk: 'Low', expenseRatio: 0.15, aum: '75,000 Cr', manager: 'Anil Bamboli', minSip: 500, type: 'Debt' },
    { schemeCode: '119016', schemeName: 'HDFC Short Term Debt Fund Direct Growth', category: 'Debt Funds', risk: 'Moderate', expenseRatio: 0.30, aum: '18,000 Cr', manager: 'Anil Bamboli', minSip: 500, type: 'Debt' },
    { schemeCode: '120692', schemeName: 'ICICI Prudential Corporate Bond Fund', category: 'Debt Funds', risk: 'Moderate', expenseRatio: 0.25, aum: '25,000 Cr', manager: 'Anuj Tagra', minSip: 1000, type: 'Debt' }
  ]
};

export const MOCK_FUND_META = {
  ...POPULAR_FUNDS.indexFunds.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {}),
  ...POPULAR_FUNDS.flexiCap.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {}),
  ...POPULAR_FUNDS.largeCap.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {}),
  ...POPULAR_FUNDS.midCap.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {}),
  ...POPULAR_FUNDS.smallCap.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {}),
  ...POPULAR_FUNDS.taxSaving.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {}),
  ...POPULAR_FUNDS.debtFunds.reduce((acc, f) => ({...acc, [f.schemeCode]: f}), {})
};

export const enrichFundData = (schemeData) => {
  const code = schemeData.schemeCode || schemeData.scheme_code;
  const meta = MOCK_FUND_META[code];
  if (meta) return { ...schemeData, schemeCode: code, ...meta };
  
  // Dynamic fallback for search results
  const name = (schemeData.schemeName || '').toLowerCase();
  let category = 'Flexi Cap';
  let risk = 'High';
  let type = 'Equity';
  
  if (name.includes('index')) { category = 'Index Funds'; risk = 'Very High'; }
  else if (name.includes('liquid')) { category = 'Liquid Funds'; risk = 'Low'; type = 'Debt'; }
  else if (name.includes('debt') || name.includes('bond')) { category = 'Debt Funds'; risk = 'Moderate'; type = 'Debt'; }
  else if (name.includes('tax') || name.includes('elss')) { category = 'ELSS'; risk = 'High'; }
  else if (name.includes('small cap')) { category = 'Small Cap'; risk = 'Very High'; }
  else if (name.includes('mid cap')) { category = 'Mid Cap'; risk = 'Very High'; }
  else if (name.includes('large cap')) { category = 'Large Cap'; risk = 'High'; }

  return { 
    ...schemeData, 
    schemeCode: code,
    category, 
    risk, 
    type,
    expenseRatio: (Math.random() * (1.2 - 0.1) + 0.1).toFixed(2),
    aum: `${Math.floor(Math.random() * 20000 + 500)} Cr`,
    manager: 'Fund Manager',
    minSip: 500
  };
};

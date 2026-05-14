import { useState, useEffect, useCallback } from 'react';
import { mutualFundService, enrichFundData, POPULAR_FUNDS } from '../services/mutualFunds';

export const useMutualFunds = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search funds
  const searchFunds = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await mutualFundService.searchSchemes(query);
      // Limit to 20 to prevent UI lag, enrich with mock analytical data
      const enriched = results.slice(0, 20).map(enrichFundData);
      return enriched;
    } catch (err) {
      setError(err.message || 'Failed to search mutual funds');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch complete details including historical NAV
  const getFundDetails = useCallback(async (schemeCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mutualFundService.getSchemeDetails(schemeCode);
      const returns = mutualFundService.calculateReturns(data.data);
      const enrichedMeta = enrichFundData(data.meta);
      
      return {
        ...enrichedMeta,
        ...returns,
        history: data.data // Array of {date, nav}
      };
    } catch (err) {
      setError(err.message || 'Failed to fetch fund details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a batch of popular funds instantly for the dashboard
  const getTopFunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate slight network delay to show premium loading state
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        indexFunds: POPULAR_FUNDS.indexFunds,
        flexiCap: POPULAR_FUNDS.flexiCap,
        largeCap: POPULAR_FUNDS.largeCap,
        midCap: POPULAR_FUNDS.midCap,
        smallCap: POPULAR_FUNDS.smallCap,
        taxSaving: POPULAR_FUNDS.taxSaving,
        debtFunds: POPULAR_FUNDS.debtFunds
      };
    } catch (err) {
      setError(err.message || 'Failed to fetch top funds');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    searchFunds,
    getFundDetails,
    getTopFunds
  };
};

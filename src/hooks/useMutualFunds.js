import { useQuery } from '@tanstack/react-query';
import { mutualFundService, enrichFundData, POPULAR_FUNDS } from '../services/mutualFunds';

export const useMutualFunds = () => {
  
  // Search funds
  const useSearchFunds = (query) => {
    return useQuery({
      queryKey: ['searchFunds', query],
      queryFn: async () => {
        if (!query || query.length < 3) return [];
        const results = await mutualFundService.searchSchemes(query);
        return results.slice(0, 20).map(enrichFundData);
      },
      enabled: !!query && query.length >= 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Fetch complete details including historical NAV
  const useFundDetails = (schemeCode) => {
    return useQuery({
      queryKey: ['fundDetails', schemeCode],
      queryFn: async () => {
        if (!schemeCode) return null;
        const data = await mutualFundService.getSchemeDetails(schemeCode);
        const returns = mutualFundService.calculateReturns(data.data);
        const enrichedMeta = enrichFundData(data.meta);
        
        return {
          ...enrichedMeta,
          ...returns,
          history: data.data // Array of {date, nav}
        };
      },
      enabled: !!schemeCode,
      staleTime: 1000 * 60 * 60, // 1 hour (NAV updates daily)
    });
  };

  // Fetch a batch of popular funds instantly for the dashboard
  const useTopFunds = () => {
    return useQuery({
      queryKey: ['topFunds'],
      queryFn: async () => {
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
      },
      staleTime: Infinity, // Static data
    });
  };

  return {
    useSearchFunds,
    useFundDetails,
    useTopFunds
  };
};

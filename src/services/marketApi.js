import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Fetch top 5 cryptocurrencies from CoinGecko for Global Market Overview
export const useMarketOverview = () => {
  return useQuery({
    queryKey: ['marketOverview'],
    queryFn: async () => {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=bitcoin,ethereum,solana,binancecoin,ripple&order=market_cap_desc&sparkline=false'
      );
      
      // Transform data to match the UI structure
      return response.data.map(coin => ({
        id: coin.id,
        name: coin.symbol.toUpperCase(),
        value: coin.current_price,
        change: coin.price_change_24h,
        percent: coin.price_change_percentage_24h,
        image: coin.image
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto refetch every 5 min
  });
};

// Fetch RSS News via rss2json
export const useFinanceNews = () => {
  return useQuery({
    queryKey: ['financeNews'],
    queryFn: async () => {
      const RSS_URL = 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms';
      const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${RSS_URL}`;
      
      const response = await axios.get(API_URL);
      
      if (response.data.status === 'ok') {
        return response.data.items.slice(0, 8).map((item, idx) => {
          // Calculate time ago
          const diffHours = (new Date() - new Date(item.pubDate)) / (1000 * 60 * 60);
          const timeText = diffHours < 1 ? 'Just now' : diffHours < 24 ? `${Math.floor(diffHours)} hours ago` : `${Math.floor(diffHours/24)} days ago`;

          return {
            id: idx,
            source: 'Economic Times',
            time: timeText,
            title: item.title,
            category: 'Market Update',
            link: item.link,
            image: item.enclosure?.link || 'https://images.unsplash.com/photo-1612013898864-f6b7d519b51e?w=500&q=80'
          };
        });
      }
      throw new Error('Failed to parse news');
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 15,
  });
};

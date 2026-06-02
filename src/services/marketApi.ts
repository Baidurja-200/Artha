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

const NEWS_IMAGES = [
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&q=80', // dark financial screen
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80', // stock market chart green/red
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&q=80', // money / rupee cash
  'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=500&q=80', // trading candle graph
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&q=80', // analytics growth
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80', // digital coin
  'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=500&q=80', // dark minimalist stats
  'https://images.unsplash.com/photo-1633156189557-2e14bc7eb553?w=500&q=80'  // abstract growth nodes
];

const getThematicImage = (title: string, index: number): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('rupee') || lowerTitle.includes('bond') || lowerTitle.includes('debt') || lowerTitle.includes('crore') || lowerTitle.includes('rs') || lowerTitle.includes('g-sec')) {
    return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&q=80';
  }
  if (lowerTitle.includes('ipo') || lowerTitle.includes('anchor') || lowerTitle.includes('stake') || lowerTitle.includes('raises') || lowerTitle.includes('buy') || lowerTitle.includes('sell') || lowerTitle.includes('deal')) {
    return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&q=80';
  }
  if (lowerTitle.includes('us stock') || lowerTitle.includes('elon') || lowerTitle.includes('sec') || lowerTitle.includes('nasdaq') || lowerTitle.includes('global')) {
    return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&q=80';
  }
  if (lowerTitle.includes('trading') || lowerTitle.includes('guide') || lowerTitle.includes('recommend') || lowerTitle.includes('high') || lowerTitle.includes('nifty') || lowerTitle.includes('sensex')) {
    return 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=500&q=80';
  }
  return NEWS_IMAGES[index % NEWS_IMAGES.length];
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
          const diffHours = (new Date().getTime() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60);
          const timeText = diffHours < 1 ? 'Just now' : diffHours < 24 ? `${Math.floor(diffHours)} hours ago` : `${Math.floor(diffHours/24)} days ago`;

          // Determine category dynamically
          let category = 'Market Update';
          const lowerTitle = item.title.toLowerCase();
          if (lowerTitle.includes('ipo') || lowerTitle.includes('anchor')) category = 'IPO News';
          else if (lowerTitle.includes('bond') || lowerTitle.includes('g-sec')) category = 'Debt & Bonds';
          else if (lowerTitle.includes('us stock') || lowerTitle.includes('elon') || lowerTitle.includes('sec')) category = 'Global Markets';
          else if (lowerTitle.includes('guide') || lowerTitle.includes('recommend')) category = 'Trading Guide';

          // Economic Times blocks external hotlinking, so we resolve to a premium Unsplash image immediately
          const rawImage = item.enclosure?.link || '';
          const isEtImage = rawImage.includes('etimg.com');
          const finalImage = (isEtImage || !rawImage) ? getThematicImage(item.title, idx) : rawImage;

          return {
            id: idx,
            source: 'Economic Times',
            time: timeText,
            title: item.title,
            category,
            link: item.link,
            image: finalImage
          };
        });
      }
      throw new Error('Failed to parse news');
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 15,
  });
};

import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { AlphaSignal } from '../types';

// Mock alpha signals for demonstration
const mockAlphaSignals: AlphaSignal[] = [
  {
    id: '1',
    title: 'PEPE Token Showing Strong Support at $0.00001',
    description: 'Technical analysis shows PEPE has established strong support at current levels with increasing volume. RSI oversold.',
    source: 'TradingView',
    category: 'defi',
    risk: 'medium',
    confidence: 78,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    tags: ['meme', 'support', 'oversold'],
    verified: true,
    upvotes: 24,
    downvotes: 3,
    tokenAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    priceTarget: 0.000012,
    timeframe: '1-2 weeks',
    blockchain: 'ethereum'
  },
  {
    id: '2',
    title: 'ARB Airdrop Round 2 Hints Discovered',
    description: 'On-chain analysis reveals potential ARB airdrop criteria being tracked. Early positioning may be beneficial.',
    source: 'DefiLlama',
    category: 'airdrop',
    risk: 'low',
    confidence: 85,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    tags: ['airdrop', 'arbitrum', 'early'],
    verified: true,
    upvotes: 156,
    downvotes: 8,
    timeframe: '3-6 months',
    blockchain: 'arbitrum'
  },
  {
    id: '3',
    title: 'NVIDIA Q4 Earnings Beat Expected',
    description: 'NVIDIA reports 22% revenue growth QoQ. AI chip demand remains strong. Consider calls before market open.',
    source: 'Bloomberg Terminal',
    category: 'tradfi',
    risk: 'medium',
    confidence: 72,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    tags: ['earnings', 'ai', 'semiconductor'],
    verified: true,
    upvotes: 89,
    downvotes: 12,
    priceTarget: 920,
    timeframe: '1-2 days'
  },
  {
    id: '4',
    title: '⚠️ Suspicious Activity: SAFEMEME Token',
    description: 'Large dev wallet movements detected. 15% of supply moved to unknown address. Recommend immediate exit.',
    source: 'Rugcheck.xyz',
    category: 'defi',
    risk: 'high',
    confidence: 95,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    tags: ['rugpull', 'warning', 'exit'],
    verified: true,
    upvotes: 203,
    downvotes: 5,
    tokenAddress: '0x742d35Cc6a6C4532CF',
    timeframe: 'immediate',
    blockchain: 'bsc'
  },
  {
    id: '5',
    title: 'Uniswap V4 Hooks Beta Launch',
    description: 'V4 testnet shows 40% gas savings. Early hook developers report successful implementations.',
    source: 'Uniswap Labs',
    category: 'dev',
    risk: 'low',
    confidence: 88,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    tags: ['uniswap', 'v4', 'hooks', 'beta'],
    verified: true,
    upvotes: 67,
    downvotes: 2,
    timeframe: '1-2 months'
  }
];

export function useAlphaFeed() {
  const [signals, setSignals] = useState<AlphaSignal[]>(mockAlphaSignals);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all' as string,
    risk: 'all' as string,
    minConfidence: 0
  });

  const filteredSignals = signals.filter(signal => {
    if (filters.category !== 'all' && signal.category !== filters.category) return false;
    if (filters.risk !== 'all' && signal.risk !== filters.risk) return false;
    if (signal.confidence < filters.minConfidence) return false;
    return true;
  });

  const refreshFeed = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch from multiple APIs
    // CoinGecko, DefiLlama, TradingView, etc.
    
    setLoading(false);
  };

  const upvoteSignal = (signalId: string) => {
    setSignals(prev => prev.map(signal => 
      signal.id === signalId 
        ? { ...signal, upvotes: signal.upvotes + 1 }
        : signal
    ));
  };

  const downvoteSignal = (signalId: string) => {
    setSignals(prev => prev.map(signal => 
      signal.id === signalId 
        ? { ...signal, downvotes: signal.downvotes + 1 }
        : signal
    ));
  };

  const showAlphaFoundNotification = (signal: AlphaSignal) => {
    if (signal.confidence >= 80) {
      toast.success('🎯 High-Confidence Alpha Found!', {
        description: (
          <div className="flex items-center gap-3">
            <img 
              src="https://images.unsplash.com/photo-1693615775129-f2004d6e3e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGdvbGRlbiUyMHJldHJpZXZlciUyMGRvZyUyMHNtaWxpbmd8ZW58MXx8fHwxNzU4NTUyODUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Happy Tracedog"
              className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
            />
            <div>
              <p className="font-medium">{signal.title}</p>
              <p className="text-sm opacity-80">Confidence: {signal.confidence}% | {signal.category.toUpperCase()}</p>
            </div>
          </div>
        ),
        duration: 8000,
        action: {
          label: 'View Signal',
          onClick: () => {
            // Scroll to the signal or highlight it
            document.getElementById(signal.id)?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add new signal occasionally
      if (Math.random() < 0.15) { // Increased chance for demo
        const categories = ['defi', 'tradfi', 'nft', 'airdrop', 'dev'] as const;
        const risks = ['low', 'medium', 'high'] as const;
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomRisk = risks[Math.floor(Math.random() * risks.length)];
        const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
        
        const signalTitles = [
          'ETH Layer 2 Arbitrage Opportunity',
          'DeFi Yield Farming Strategy Detected',
          'Memecoin Momentum Building',
          'Institutional Accumulation Pattern',
          'Cross-Chain Bridge Inefficiency',
          'Governance Token Proposal Impact',
          'Staking Rewards Rate Change',
          'DEX Liquidity Pool Imbalance'
        ];
        
        const newSignal: AlphaSignal = {
          id: Date.now().toString(),
          title: signalTitles[Math.floor(Math.random() * signalTitles.length)],
          description: 'AI scanner identified potential trading opportunity based on on-chain data analysis and market sentiment indicators.',
          source: 'Tracedog AI',
          category: randomCategory,
          risk: randomRisk,
          confidence: confidence,
          timestamp: new Date(),
          tags: ['ai-detected', 'real-time', randomCategory],
          verified: confidence > 85,
          upvotes: Math.floor(Math.random() * 20),
          downvotes: Math.floor(Math.random() * 5),
          timeframe: ['1-2 hours', '4-8 hours', '1-3 days', '1-2 weeks'][Math.floor(Math.random() * 4)],
          blockchain: ['ethereum', 'arbitrum', 'polygon', 'bsc'][Math.floor(Math.random() * 4)]
        };
        
        setSignals(prev => [newSignal, ...prev].slice(0, 20));
        
        // Show dog notification for high-confidence signals
        showAlphaFoundNotification(newSignal);
      }
    }, 12000); // Every 12 seconds for demo

    return () => clearInterval(interval);
  }, []);

  return {
    signals: filteredSignals,
    loading,
    filters,
    setFilters,
    refreshFeed,
    upvoteSignal,
    downvoteSignal
  };
}
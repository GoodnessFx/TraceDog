// Core types for Tracedog application

export interface AlphaSignal {
  id: string;
  title: string;
  description: string;
  source: string;
  category: 'defi' | 'tradfi' | 'nft' | 'airdrop' | 'dev';
  risk: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  timestamp: Date;
  tags: string[];
  verified: boolean;
  upvotes: number;
  downvotes: number;
  tokenAddress?: string;
  priceTarget?: number;
  timeframe?: string;
  blockchain?: string;
}

export interface SecurityAnalysis {
  contractAddress: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  liquidityLocked: boolean;
  rugPullRisk: number; // 0-100
  devWalletMovement: boolean;
  honeypotDetected: boolean;
  auditStatus: 'verified' | 'pending' | 'unaudited';
  lastUpdated: Date;
  findings: string[];
}

export interface TradingOpportunity {
  id: string;
  token: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  currentPrice: number;
  targetPrice: number;
  stopLoss?: number;
  confidence: number;
  reasoning: string[];
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  source: string;
  createdAt: Date;
}

export interface DeveloperUpdate {
  id: string;
  title: string;
  description: string;
  category: 'sdk' | 'framework' | 'protocol' | 'tool' | 'security';
  githubUrl?: string;
  docsUrl?: string;
  impact: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date;
  upvotes: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  alphaScore: number;
  reputation: number;
  watchlist: string[];
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  categories: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  notifications: {
    email: boolean;
    push: boolean;
    telegram: boolean;
    discord: boolean;
  };
  filters: {
    minConfidence: number;
    maxRisk: 'low' | 'medium' | 'high';
    sources: string[];
  };
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'low' | 'medium' | 'high';
  tokens: string[];
  publishedAt: Date;
  verified: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  type: 'opportunity' | 'security' | 'news' | 'dev';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
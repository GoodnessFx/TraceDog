import { httpJson } from '../http';
import { config } from '@/config';

export interface ProjectData {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism';
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  logo?: string;
  category: 'defi' | 'gaming' | 'nft' | 'infrastructure' | 'meme' | 'ai' | 'social';
  launchDate: string;
  marketCap?: number;
  volume24h?: number;
  price?: number;
  priceChange24h?: number;
  holders?: number;
  liquidity?: number;
  riskScore: number; // 0-100 (0 = highest risk, 100 = lowest risk)
  verificationStatus: 'verified' | 'unverified' | 'suspicious' | 'scam';
  socialMetrics: {
    twitterFollowers?: number;
    telegramMembers?: number;
    discordMembers?: number;
    githubStars?: number;
  };
  contractMetrics: {
    isHoneypot: boolean;
    hasLiquidity: boolean;
    isRenounced: boolean;
    hasAudit: boolean;
    mintFunction: boolean;
    proxyContract: boolean;
  };
  airdropPotential: {
    hasAirdrop: boolean;
    confidence: number; // 0-100
    estimatedValue?: string;
    requirements?: string[];
  };
  lastUpdated: string;
}

export interface ScanFilters {
  chains?: string[];
  categories?: string[];
  minMarketCap?: number;
  maxMarketCap?: number;
  minRiskScore?: number;
  launchedWithin?: '1h' | '6h' | '24h' | '7d' | '30d';
  hasAirdrop?: boolean;
  verifiedOnly?: boolean;
}

class ProjectScannerService {
  private scanInterval: NodeJS.Timeout | null = null;
  private subscribers: ((projects: ProjectData[]) => void)[] = [];

  // Scan for new projects across multiple chains
  async scanNewProjects(filters: ScanFilters = {}): Promise<ProjectData[]> {
    const projects: ProjectData[] = [];
    
    try {
      // Scan Ethereum
      if (!filters.chains || filters.chains.includes('ethereum')) {
        const ethProjects = await this.scanEthereumProjects(filters);
        projects.push(...ethProjects);
      }
      
      // Scan BSC
      if (!filters.chains || filters.chains.includes('bsc')) {
        const bscProjects = await this.scanBSCProjects(filters);
        projects.push(...bscProjects);
      }
      
      // Scan Polygon
      if (!filters.chains || filters.chains.includes('polygon')) {
        const polygonProjects = await this.scanPolygonProjects(filters);
        projects.push(...polygonProjects);
      }
      
      // Apply additional filters
      let filteredProjects = this.applyFilters(projects, filters);
      
      // Sort by risk score and market cap
      filteredProjects = filteredProjects.sort((a, b) => {
        if (a.riskScore !== b.riskScore) {
          return b.riskScore - a.riskScore; // Higher risk score first
        }
        return (b.marketCap || 0) - (a.marketCap || 0); // Higher market cap first
      });
      
      return filteredProjects;
    } catch (error) {
      console.error('Error scanning projects:', error);
      return [];
    }
  }

  // Scan Ethereum for new tokens and projects
  private async scanEthereumProjects(filters: ScanFilters): Promise<ProjectData[]> {
    if (!config.apis.etherscan) return [];
    
    try {
      // Get latest token transfers to identify new tokens
      const response = await httpJson<any>(
        `https://api.etherscan.io/api?module=account&action=tokentx&startblock=0&endblock=latest&sort=desc&apikey=${config.apis.etherscan}`
      );
      
      if (response.status !== '1') return [];
      
      const recentTransfers = response.result.slice(0, 50); // Get latest 50 transfers
      const uniqueTokens = new Map<string, any>();
      
      // Extract unique token addresses
      recentTransfers.forEach((tx: any) => {
        if (!uniqueTokens.has(tx.contractAddress)) {
          uniqueTokens.set(tx.contractAddress, tx);
        }
      });
      
      const projects: ProjectData[] = [];
      
      // Analyze each unique token
      for (const [address, tx] of uniqueTokens) {
        try {
          const projectData = await this.analyzeToken(address, 'ethereum', tx);
          if (projectData && this.passesInitialFilters(projectData, filters)) {
            projects.push(projectData);
          }
        } catch (error) {
          console.error(`Error analyzing token ${address}:`, error);
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error scanning Ethereum:', error);
      return [];
    }
  }

  // Scan BSC for new projects
  private async scanBSCProjects(filters: ScanFilters): Promise<ProjectData[]> {
    if (!config.apis.bscscan) return [];
    
    try {
      const response = await httpJson<any>(
        `https://api.bscscan.com/api?module=account&action=tokentx&startblock=0&endblock=latest&sort=desc&apikey=${config.apis.bscscan}`
      );
      
      if (response.status !== '1') return [];
      
      const recentTransfers = response.result.slice(0, 30);
      const uniqueTokens = new Map<string, any>();
      
      recentTransfers.forEach((tx: any) => {
        if (!uniqueTokens.has(tx.contractAddress)) {
          uniqueTokens.set(tx.contractAddress, tx);
        }
      });
      
      const projects: ProjectData[] = [];
      
      for (const [address, tx] of uniqueTokens) {
        try {
          const projectData = await this.analyzeToken(address, 'bsc', tx);
          if (projectData && this.passesInitialFilters(projectData, filters)) {
            projects.push(projectData);
          }
        } catch (error) {
          console.error(`Error analyzing BSC token ${address}:`, error);
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error scanning BSC:', error);
      return [];
    }
  }

  // Scan Polygon for new projects
  private async scanPolygonProjects(filters: ScanFilters): Promise<ProjectData[]> {
    if (!config.apis.polygonscan) return [];
    
    try {
      const response = await httpJson<any>(
        `https://api.polygonscan.com/api?module=account&action=tokentx&startblock=0&endblock=latest&sort=desc&apikey=${config.apis.polygonscan}`
      );
      
      if (response.status !== '1') return [];
      
      const recentTransfers = response.result.slice(0, 20);
      const uniqueTokens = new Map<string, any>();
      
      recentTransfers.forEach((tx: any) => {
        if (!uniqueTokens.has(tx.contractAddress)) {
          uniqueTokens.set(tx.contractAddress, tx);
        }
      });
      
      const projects: ProjectData[] = [];
      
      for (const [address, tx] of uniqueTokens) {
        try {
          const projectData = await this.analyzeToken(address, 'polygon', tx);
          if (projectData && this.passesInitialFilters(projectData, filters)) {
            projects.push(projectData);
          }
        } catch (error) {
          console.error(`Error analyzing Polygon token ${address}:`, error);
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error scanning Polygon:', error);
      return [];
    }
  }

  // Analyze individual token for project data
  private async analyzeToken(address: string, chain: string, txData: any): Promise<ProjectData | null> {
    try {
      // Get basic token info
      const tokenInfo = await this.getTokenInfo(address, chain);
      if (!tokenInfo) return null;
      
      // Check for honeypot
      const honeypotCheck = await this.checkHoneypot(address, chain);
      
      // Get social metrics
      const socialMetrics = await this.getSocialMetrics(tokenInfo.name, tokenInfo.symbol);
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(tokenInfo, honeypotCheck, socialMetrics);
      
      // Check airdrop potential
      const airdropPotential = await this.checkAirdropPotential(address, chain, tokenInfo);
      
      const project: ProjectData = {
        id: `${chain}-${address}`,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        address,
        chain: chain as any,
        description: tokenInfo.description,
        website: tokenInfo.website,
        twitter: tokenInfo.twitter,
        category: this.categorizeProject(tokenInfo.name, tokenInfo.description),
        launchDate: new Date(parseInt(txData.timeStamp) * 1000).toISOString(),
        marketCap: tokenInfo.marketCap,
        volume24h: tokenInfo.volume24h,
        price: tokenInfo.price,
        priceChange24h: tokenInfo.priceChange24h,
        holders: tokenInfo.holders,
        liquidity: tokenInfo.liquidity,
        riskScore,
        verificationStatus: this.getVerificationStatus(riskScore, socialMetrics),
        socialMetrics,
        contractMetrics: {
          isHoneypot: honeypotCheck.isHoneypot,
          hasLiquidity: tokenInfo.liquidity > 10000,
          isRenounced: honeypotCheck.isRenounced,
          hasAudit: honeypotCheck.hasAudit,
          mintFunction: honeypotCheck.hasMintFunction,
          proxyContract: honeypotCheck.isProxy
        },
        airdropPotential,
        lastUpdated: new Date().toISOString()
      };
      
      return project;
    } catch (error) {
      console.error(`Error analyzing token ${address}:`, error);
      return null;
    }
  }

  // Get token information from various sources
  private async getTokenInfo(address: string, _chain: string) {
    // This would integrate with CoinGecko, DexScreener, etc.
    // For now, return mock data structure
    return {
      name: `Token_${address.slice(0, 6)}`,
      symbol: `TKN${address.slice(-3)}`,
      description: 'New token detected',
      website: undefined,
      twitter: undefined,
      marketCap: Math.random() * 1000000,
      volume24h: Math.random() * 100000,
      price: Math.random() * 10,
      priceChange24h: (Math.random() - 0.5) * 20,
      holders: Math.floor(Math.random() * 1000),
      liquidity: Math.random() * 500000
    };
  }

  // Check if token is honeypot using TokenSniffer API
  private async checkHoneypot(address: string, chain: string) {
    if (!config.apis.tokensniffer) {
      return {
        isHoneypot: false,
        isRenounced: false,
        hasAudit: false,
        hasMintFunction: false,
        isProxy: false
      };
    }
    
    try {
      const response = await httpJson<any>(
        `https://tokensniffer.com/api/v2/tokens/${chain}/${address}?apikey=${config.apis.tokensniffer}`
      );
      
      return {
        isHoneypot: response.honeypot || false,
        isRenounced: response.renounced || false,
        hasAudit: response.audit || false,
        hasMintFunction: response.mintFunction || false,
        isProxy: response.proxy || false
      };
    } catch (error) {
      return {
        isHoneypot: false,
        isRenounced: false,
        hasAudit: false,
        hasMintFunction: false,
        isProxy: false
      };
    }
  }

  // Get social metrics
  private async getSocialMetrics(_name: string, _symbol: string) {
    // This would integrate with Twitter API, etc.
    return {
      twitterFollowers: Math.floor(Math.random() * 10000),
      telegramMembers: Math.floor(Math.random() * 5000),
      discordMembers: Math.floor(Math.random() * 3000),
      githubStars: Math.floor(Math.random() * 100)
    };
  }

  // Calculate risk score based on various factors
  private calculateRiskScore(tokenInfo: any, honeypotCheck: any, socialMetrics: any): number {
    let score = 50; // Start with neutral score
    
    // Positive factors
    if (!honeypotCheck.isHoneypot) score += 20;
    if (honeypotCheck.hasAudit) score += 15;
    if (honeypotCheck.isRenounced) score += 10;
    if (tokenInfo.liquidity > 100000) score += 10;
    if (tokenInfo.holders > 100) score += 5;
    if (socialMetrics.twitterFollowers > 1000) score += 5;
    
    // Negative factors
    if (honeypotCheck.isHoneypot) score -= 40;
    if (honeypotCheck.hasMintFunction) score -= 10;
    if (tokenInfo.liquidity < 10000) score -= 15;
    if (tokenInfo.holders < 10) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  // Categorize project based on name and description
  private categorizeProject(name: string, description?: string): ProjectData['category'] {
    const text = `${name} ${description || ''}`.toLowerCase();
    
    if (text.includes('defi') || text.includes('swap') || text.includes('dex')) return 'defi';
    if (text.includes('game') || text.includes('gaming') || text.includes('play')) return 'gaming';
    if (text.includes('nft') || text.includes('collectible')) return 'nft';
    if (text.includes('ai') || text.includes('artificial')) return 'ai';
    if (text.includes('social') || text.includes('community')) return 'social';
    if (text.includes('meme') || text.includes('dog') || text.includes('cat')) return 'meme';
    
    return 'infrastructure';
  }

  // Get verification status
  private getVerificationStatus(riskScore: number, socialMetrics: any): ProjectData['verificationStatus'] {
    if (riskScore < 30) return 'scam';
    if (riskScore < 50) return 'suspicious';
    if (riskScore > 80 && socialMetrics.twitterFollowers > 5000) return 'verified';
    return 'unverified';
  }

  // Check airdrop potential
  private async checkAirdropPotential(_address: string, _chain: string, _tokenInfo: any) {
    // Analyze patterns that suggest airdrop potential
    const hasAirdrop = Math.random() > 0.7; // 30% chance for demo
    
    return {
      hasAirdrop,
      confidence: hasAirdrop ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
      estimatedValue: hasAirdrop ? `$${Math.floor(Math.random() * 1000) + 100} - $${Math.floor(Math.random() * 5000) + 1000}` : undefined,
      requirements: hasAirdrop ? [
        'Hold tokens for 30+ days',
        'Interact with protocol',
        'Refer friends',
        'Complete social tasks'
      ] : undefined
    };
  }

  // Apply filters to projects
  private applyFilters(projects: ProjectData[], filters: ScanFilters): ProjectData[] {
    return projects.filter(project => {
      if (filters.categories && !filters.categories.includes(project.category)) return false;
      if (filters.minMarketCap && (project.marketCap || 0) < filters.minMarketCap) return false;
      if (filters.maxMarketCap && (project.marketCap || 0) > filters.maxMarketCap) return false;
      if (filters.minRiskScore && project.riskScore < filters.minRiskScore) return false;
      if (filters.hasAirdrop && !project.airdropPotential.hasAirdrop) return false;
      if (filters.verifiedOnly && project.verificationStatus !== 'verified') return false;
      
      if (filters.launchedWithin) {
        const launchTime = new Date(project.launchDate).getTime();
        const now = Date.now();
        const timeLimit = this.getTimeLimit(filters.launchedWithin);
        if (now - launchTime > timeLimit) return false;
      }
      
      return true;
    });
  }

  // Check if project passes initial filters
  private passesInitialFilters(project: ProjectData, _filters: ScanFilters): boolean {
    // Basic quality filters
    if (project.riskScore < 20) return false; // Too risky
    if (project.contractMetrics.isHoneypot) return false; // Definitely honeypot
    if ((project.marketCap || 0) < 1000) return false; // Too small
    
    return true;
  }

  // Get time limit in milliseconds
  private getTimeLimit(period: string): number {
    switch (period) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  // Start continuous scanning
  startContinuousScanning(intervalMs: number = 60000, filters: ScanFilters = {}) {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    this.scanInterval = setInterval(async () => {
      try {
        const projects = await this.scanNewProjects(filters);
        this.notifySubscribers(projects);
      } catch (error) {
        console.error('Error in continuous scanning:', error);
      }
    }, intervalMs);
  }

  // Stop continuous scanning
  stopContinuousScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  // Subscribe to scan results
  subscribe(callback: (projects: ProjectData[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify subscribers
  private notifySubscribers(projects: ProjectData[]) {
    this.subscribers.forEach(callback => {
      try {
        callback(projects);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }
}

export const projectScanner = new ProjectScannerService();
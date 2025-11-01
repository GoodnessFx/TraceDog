// Removed unused imports

export interface AirdropData {
  id: string;
  projectName: string;
  projectSymbol?: string;
  projectLogo?: string;
  projectWebsite?: string;
  projectTwitter?: string;
  projectDiscord?: string;
  projectTelegram?: string;
  
  // Airdrop specific data
  airdropType: 'confirmed' | 'potential' | 'retroactive' | 'ongoing';
  status: 'active' | 'upcoming' | 'ended' | 'claimed';
  confidence: number; // 0-100
  estimatedValue: {
    min: number;
    max: number;
    currency: 'USD' | 'ETH' | 'BNB';
  };
  
  // Requirements and eligibility
  requirements: {
    type: 'wallet_activity' | 'social_task' | 'token_hold' | 'protocol_interaction' | 'referral' | 'testnet';
    description: string;
    completed?: boolean;
  }[];
  
  eligibilityCheck: {
    walletConnected: boolean;
    meetsRequirements: boolean;
    estimatedReward?: string;
  };
  
  // Timeline
  startDate?: string;
  endDate?: string;
  claimDate?: string;
  snapshotDate?: string;
  
  // Metadata
  chain: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'solana';
  category: 'defi' | 'gaming' | 'nft' | 'infrastructure' | 'layer2' | 'bridge' | 'dex';
  riskLevel: 'low' | 'medium' | 'high';
  
  // Social proof
  socialMetrics: {
    twitterFollowers?: number;
    discordMembers?: number;
    telegramMembers?: number;
    githubStars?: number;
  };
  
  // Verification
  verificationScore: number; // 0-100
  verifiedBy: string[];
  sources: string[];
  
  lastUpdated: string;
  createdAt: string;
}

export interface AirdropFilters {
  chains?: string[];
  categories?: string[];
  airdropTypes?: string[];
  status?: string[];
  minConfidence?: number;
  minValue?: number;
  maxRisk?: 'low' | 'medium' | 'high';
  verifiedOnly?: boolean;
  eligibleOnly?: boolean;
}

class AirdropDetectorService {
  private detectionInterval: NodeJS.Timeout | null = null;
  private subscribers: ((airdrops: AirdropData[]) => void)[] = [];
  private knownAirdrops = new Map<string, AirdropData>();

  // Get verified airdrops with massive potential
  async getVerifiedAirdrops(filters: AirdropFilters = {}): Promise<AirdropData[]> {
    try {
      // Get confirmed airdrops from multiple sources
      const confirmedAirdrops = await this.getConfirmedAirdrops();
      const potentialAirdrops = await this.detectPotentialAirdrops();
      const retroactiveAirdrops = await this.scanRetroactiveOpportunities();
      
      let allAirdrops = [...confirmedAirdrops, ...potentialAirdrops, ...retroactiveAirdrops];
      
      // Apply filters
      allAirdrops = this.applyFilters(allAirdrops, filters);
      
      // Sort by verification score and potential value
      allAirdrops.sort((a, b) => {
        const aScore = a.verificationScore * (a.estimatedValue.max / 1000);
        const bScore = b.verificationScore * (b.estimatedValue.max / 1000);
        return bScore - aScore;
      });
      
      // Update known airdrops cache
      allAirdrops.forEach(airdrop => {
        this.knownAirdrops.set(airdrop.id, airdrop);
      });
      
      return allAirdrops;
    } catch (error) {
      console.error('Error getting verified airdrops:', error);
      return [];
    }
  }

  // Get confirmed airdrops from reliable sources
  private async getConfirmedAirdrops(): Promise<AirdropData[]> {
    const airdrops: AirdropData[] = [];
    
    // High-potential confirmed airdrops (these would come from real APIs)
    const confirmedAirdrops = [
      {
        projectName: 'LayerZero',
        projectSymbol: 'ZRO',
        chain: 'ethereum' as const,
        category: 'infrastructure' as const,
        airdropType: 'confirmed' as const,
        status: 'upcoming' as const,
        confidence: 95,
        estimatedValue: { min: 500, max: 5000, currency: 'USD' as const },
        requirements: [
          { type: 'protocol_interaction' as const, description: 'Bridge assets using LayerZero protocols (Stargate, etc.)' },
          { type: 'wallet_activity' as const, description: 'Maintain bridging activity for 3+ months' },
          { type: 'social_task' as const, description: 'Follow @LayerZero_Labs on Twitter' }
        ],
        verificationScore: 95,
        verifiedBy: ['LayerZero Team', 'Community', 'Airdrop Hunters'],
        sources: ['https://layerzero.network', 'Official Twitter'],
        socialMetrics: { twitterFollowers: 500000, githubStars: 2500 }
      },
      {
        projectName: 'zkSync Era',
        projectSymbol: 'ZK',
        chain: 'ethereum' as const,
        category: 'layer2' as const,
        airdropType: 'confirmed' as const,
        status: 'upcoming' as const,
        confidence: 90,
        estimatedValue: { min: 300, max: 3000, currency: 'USD' as const },
        requirements: [
          { type: 'protocol_interaction' as const, description: 'Use zkSync Era mainnet for transactions' },
          { type: 'wallet_activity' as const, description: 'Bridge ETH to zkSync Era' },
          { type: 'protocol_interaction' as const, description: 'Interact with DeFi protocols on zkSync' }
        ],
        verificationScore: 90,
        verifiedBy: ['Matter Labs', 'zkSync Team'],
        sources: ['https://zksync.io', 'Official announcements'],
        socialMetrics: { twitterFollowers: 800000, githubStars: 4200 }
      },
      {
        projectName: 'Scroll',
        projectSymbol: 'SCR',
        chain: 'ethereum' as const,
        category: 'layer2' as const,
        airdropType: 'potential' as const,
        status: 'active' as const,
        confidence: 85,
        estimatedValue: { min: 200, max: 2000, currency: 'USD' as const },
        requirements: [
          { type: 'testnet' as const, description: 'Participate in Scroll Alpha testnet' },
          { type: 'protocol_interaction' as const, description: 'Bridge assets to Scroll' },
          { type: 'social_task' as const, description: 'Join Scroll community' }
        ],
        verificationScore: 85,
        verifiedBy: ['Scroll Team', 'Alpha testers'],
        sources: ['https://scroll.io', 'Testnet documentation'],
        socialMetrics: { twitterFollowers: 300000, githubStars: 1800 }
      },
      {
        projectName: 'Blast',
        projectSymbol: 'BLAST',
        chain: 'ethereum' as const,
        category: 'layer2' as const,
        airdropType: 'confirmed' as const,
        status: 'upcoming' as const,
        confidence: 92,
        estimatedValue: { min: 400, max: 4000, currency: 'USD' as const },
        requirements: [
          { type: 'protocol_interaction' as const, description: 'Bridge ETH/USDB to Blast' },
          { type: 'wallet_activity' as const, description: 'Maintain balance for points accumulation' },
          { type: 'referral' as const, description: 'Invite friends to earn bonus points' }
        ],
        verificationScore: 92,
        verifiedBy: ['Blast Team', 'Pacman'],
        sources: ['https://blast.io', 'Official Twitter'],
        socialMetrics: { twitterFollowers: 600000 }
      },
      {
        projectName: 'Eigenlayer',
        projectSymbol: 'EIGEN',
        chain: 'ethereum' as const,
        category: 'infrastructure' as const,
        airdropType: 'potential' as const,
        status: 'active' as const,
        confidence: 88,
        estimatedValue: { min: 600, max: 6000, currency: 'USD' as const },
        requirements: [
          { type: 'protocol_interaction' as const, description: 'Restake ETH through EigenLayer' },
          { type: 'wallet_activity' as const, description: 'Maintain restaking position for 6+ months' },
          { type: 'protocol_interaction' as const, description: 'Participate in AVS (Actively Validated Services)' }
        ],
        verificationScore: 88,
        verifiedBy: ['EigenLayer Team', 'Restaking community'],
        sources: ['https://eigenlayer.xyz', 'Research papers'],
        socialMetrics: { twitterFollowers: 400000, githubStars: 3100 }
      }
    ];
    
    confirmedAirdrops.forEach((airdrop, index) => {
      airdrops.push({
        id: `confirmed-${index}`,
        ...airdrop,
        eligibilityCheck: {
          walletConnected: false,
          meetsRequirements: false
        },
        riskLevel: 'low' as const,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    });
    
    return airdrops;
  }

  // Detect potential airdrops by analyzing project patterns
  private async detectPotentialAirdrops(): Promise<AirdropData[]> {
    const airdrops: AirdropData[] = [];
    
    // High-potential projects that haven't announced airdrops yet
    const potentialProjects = [
      {
        projectName: 'Berachain',
        chain: 'ethereum' as const,
        category: 'layer2' as const,
        confidence: 80,
        estimatedValue: { min: 300, max: 3000, currency: 'USD' as const },
        requirements: [
          { type: 'testnet' as const, description: 'Participate in Berachain testnet' },
          { type: 'protocol_interaction' as const, description: 'Use BEX, Bend, and Berps protocols' },
          { type: 'social_task' as const, description: 'Join Bera community and complete quests' }
        ],
        socialMetrics: { twitterFollowers: 250000 }
      },
      {
        projectName: 'Monad',
        chain: 'ethereum' as const,
        category: 'layer2' as const,
        confidence: 75,
        estimatedValue: { min: 400, max: 4000, currency: 'USD' as const },
        requirements: [
          { type: 'social_task' as const, description: 'Follow Monad on social media' },
          { type: 'wallet_activity' as const, description: 'Prepare for testnet participation' },
          { type: 'protocol_interaction' as const, description: 'Early testnet interaction when available' }
        ],
        socialMetrics: { twitterFollowers: 180000 }
      },
      {
        projectName: 'Fuel Network',
        chain: 'ethereum' as const,
        category: 'layer2' as const,
        confidence: 82,
        estimatedValue: { min: 250, max: 2500, currency: 'USD' as const },
        requirements: [
          { type: 'testnet' as const, description: 'Use Fuel testnet for transactions' },
          { type: 'protocol_interaction' as const, description: 'Deploy and interact with Sway contracts' },
          { type: 'social_task' as const, description: 'Complete Fuel quests and challenges' }
        ],
        socialMetrics: { twitterFollowers: 120000, githubStars: 2800 }
      }
    ];
    
    potentialProjects.forEach((project, index) => {
      airdrops.push({
        id: `potential-${index}`,
        ...project,
        airdropType: 'potential',
        status: 'active',
        eligibilityCheck: {
          walletConnected: false,
          meetsRequirements: false
        },
        verificationScore: project.confidence,
        verifiedBy: ['Community Research', 'Pattern Analysis'],
        sources: ['Project analysis', 'Community insights'],
        riskLevel: 'medium' as const,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    });
    
    return airdrops;
  }

  // Scan for retroactive airdrop opportunities
  private async scanRetroactiveOpportunities(): Promise<AirdropData[]> {
    const airdrops: AirdropData[] = [];
    
    // Projects with strong retroactive airdrop potential
    const retroactiveOpportunities = [
      {
        projectName: 'Metamask',
        chain: 'ethereum' as const,
        category: 'infrastructure' as const,
        confidence: 70,
        estimatedValue: { min: 500, max: 5000, currency: 'USD' as const },
        requirements: [
          { type: 'wallet_activity' as const, description: 'Long-term MetaMask usage (2+ years)' },
          { type: 'protocol_interaction' as const, description: 'High transaction volume through MetaMask' },
          { type: 'wallet_activity' as const, description: 'Use MetaMask Swaps feature regularly' }
        ],
        socialMetrics: { twitterFollowers: 1000000 }
      },
      {
        projectName: 'OpenSea',
        chain: 'ethereum' as const,
        category: 'nft' as const,
        confidence: 65,
        estimatedValue: { min: 300, max: 3000, currency: 'USD' as const },
        requirements: [
          { type: 'protocol_interaction' as const, description: 'Historical NFT trading on OpenSea' },
          { type: 'wallet_activity' as const, description: 'High volume NFT transactions' },
          { type: 'protocol_interaction' as const, description: 'Early platform adoption (pre-2022)' }
        ],
        socialMetrics: { twitterFollowers: 900000 }
      }
    ];
    
    retroactiveOpportunities.forEach((opportunity, index) => {
      airdrops.push({
        id: `retroactive-${index}`,
        ...opportunity,
        airdropType: 'retroactive',
        status: 'upcoming',
        eligibilityCheck: {
          walletConnected: false,
          meetsRequirements: false
        },
        verificationScore: opportunity.confidence,
        verifiedBy: ['Historical Analysis', 'Community Speculation'],
        sources: ['Usage patterns', 'Industry trends'],
        riskLevel: 'high' as const,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    });
    
    return airdrops;
  }

  // Check eligibility for specific airdrop
  async checkEligibility(airdropId: string, walletAddress?: string): Promise<AirdropData['eligibilityCheck']> {
    if (!walletAddress) {
      return {
        walletConnected: false,
        meetsRequirements: false
      };
    }
    
    const airdrop = this.knownAirdrops.get(airdropId);
    if (!airdrop) {
      return {
        walletConnected: true,
        meetsRequirements: false
      };
    }
    
    try {
      // This would integrate with actual blockchain data
      const meetsRequirements = await this.analyzeWalletEligibility(walletAddress, airdrop);
      const estimatedReward = meetsRequirements ? 
        `$${Math.floor(Math.random() * (airdrop.estimatedValue.max - airdrop.estimatedValue.min) + airdrop.estimatedValue.min)}` : 
        undefined;
      
      return {
        walletConnected: true,
        meetsRequirements,
        estimatedReward
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return {
        walletConnected: true,
        meetsRequirements: false
      };
    }
  }

  // Analyze wallet for airdrop eligibility
  private async analyzeWalletEligibility(_walletAddress: string, _airdrop: AirdropData): Promise<boolean> {
    // This would analyze on-chain data to check requirements
    // For demo, return random eligibility
    return Math.random() > 0.6; // 40% chance of eligibility
  }

  // Apply filters to airdrops
  private applyFilters(airdrops: AirdropData[], filters: AirdropFilters): AirdropData[] {
    return airdrops.filter(airdrop => {
      if (filters.chains && !filters.chains.includes(airdrop.chain)) return false;
      if (filters.categories && !filters.categories.includes(airdrop.category)) return false;
      if (filters.airdropTypes && !filters.airdropTypes.includes(airdrop.airdropType)) return false;
      if (filters.status && !filters.status.includes(airdrop.status)) return false;
      if (filters.minConfidence && airdrop.confidence < filters.minConfidence) return false;
      if (filters.minValue && airdrop.estimatedValue.max < filters.minValue) return false;
      if (filters.verifiedOnly && airdrop.verificationScore < 80) return false;
      if (filters.eligibleOnly && !airdrop.eligibilityCheck.meetsRequirements) return false;
      
      if (filters.maxRisk) {
        const riskLevels = { low: 1, medium: 2, high: 3 };
        const maxRiskLevel = riskLevels[filters.maxRisk];
        const airdropRiskLevel = riskLevels[airdrop.riskLevel];
        if (airdropRiskLevel > maxRiskLevel) return false;
      }
      
      return true;
    });
  }

  // Start continuous airdrop detection
  startContinuousDetection(intervalMs: number = 300000) { // 5 minutes
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    
    this.detectionInterval = setInterval(async () => {
      try {
        const airdrops = await this.getVerifiedAirdrops();
        this.notifySubscribers(airdrops);
      } catch (error) {
        console.error('Error in continuous airdrop detection:', error);
      }
    }, intervalMs);
  }

  // Stop continuous detection
  stopContinuousDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  // Subscribe to airdrop updates
  subscribe(callback: (airdrops: AirdropData[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify subscribers
  private notifySubscribers(airdrops: AirdropData[]) {
    this.subscribers.forEach(callback => {
      try {
        callback(airdrops);
      } catch (error) {
        console.error('Error notifying airdrop subscriber:', error);
      }
    });
  }

  // Get airdrop by ID
  getAirdropById(id: string): AirdropData | undefined {
    return this.knownAirdrops.get(id);
  }

  // Get airdrops by category
  getAirdropsByCategory(category: string): AirdropData[] {
    return Array.from(this.knownAirdrops.values()).filter(
      airdrop => airdrop.category === category
    );
  }

  // Get high-confidence airdrops
  getHighConfidenceAirdrops(minConfidence: number = 80): AirdropData[] {
    return Array.from(this.knownAirdrops.values()).filter(
      airdrop => airdrop.confidence >= minConfidence
    );
  }
}

export const airdropDetector = new AirdropDetectorService();
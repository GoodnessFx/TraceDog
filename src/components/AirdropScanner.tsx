import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed unused Select and Tabs UI imports
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Clock, 
  Users, 
  Shield, 
  ExternalLink,
  Star,
  AlertTriangle,
  CheckCircle,
  Gift,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import { airdropDetector, AirdropFilters } from '@/services/scanner/airdropDetector';

const AirdropScanner: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChain, setSelectedChain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');
  const [isScanning, setIsScanning] = useState(false);

  // Build filters for airdrop detection
  const filters = useMemo((): AirdropFilters => {
    const filterObj: AirdropFilters = {
      verifiedOnly: true, // Only show verified airdrops with high potential
      minConfidence: 70
    };
    
    if (selectedCategory !== 'all') {
      filterObj.categories = [selectedCategory];
    }
    
    if (selectedChain !== 'all') {
      filterObj.chains = [selectedChain];
    }
    
    if (selectedStatus !== 'all') {
      filterObj.status = [selectedStatus];
    }
    
    return filterObj;
  }, [selectedCategory, selectedChain, selectedStatus]);

  // Fetch verified airdrops with massive potential
  const { data: airdrops = [], isLoading, error, refetch } = useQuery({
    queryKey: ['verified-airdrops', filters],
    queryFn: async () => {
      setIsScanning(true);
      try {
        const result = await airdropDetector.getVerifiedAirdrops(filters);
        return result;
      } finally {
        setIsScanning(false);
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes for live updates
    staleTime: 240000, // Consider data stale after 4 minutes
  });

  // Start continuous airdrop detection on component mount
  useEffect(() => {
    airdropDetector.startContinuousDetection();
    
    return () => {
      airdropDetector.stopContinuousDetection();
    };
  }, []);

  // Filter and sort airdrops
  const filteredAirdrops = useMemo(() => {
    let filtered = airdrops;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(airdrop =>
        airdrop.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (airdrop.projectSymbol && airdrop.projectSymbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
        airdrop.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'value':
          return b.estimatedValue.max - a.estimatedValue.max;
        case 'verification':
          return b.verificationScore - a.verificationScore;
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [airdrops, searchTerm, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="h-3 w-3" />;
      case 'upcoming': return <Clock className="h-3 w-3" />;
      case 'ended': return <CheckCircle className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'defi', label: 'DeFi' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'nft', label: 'NFT' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'layer2', label: 'Layer 2' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'dex', label: 'DEX' }
  ];

  const chains = [
    { value: 'all', label: 'All Chains' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'bsc', label: 'BSC' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' },
    { value: 'solana', label: 'Solana' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' }
  ];

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Airdrops</h3>
            <p className="text-slate-300 mb-4">Failed to fetch airdrop data. Please try again.</p>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Verified Airdrops
            </h1>
            {isScanning && (
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 animate-spin" />
            )}
          </div>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Discover verified airdrops with massive potential. Live scanning and real-time updates.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Scanning</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{filteredAirdrops.length} Verified</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search airdrops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white text-sm sm:text-base"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-xs sm:text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-xs sm:text-sm"
                >
                  {chains.map(chain => (
                    <option key={chain.value} value={chain.value}>{chain.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-xs sm:text-sm"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 sm:px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-xs sm:text-sm"
                >
                  <option value="confidence">Confidence</option>
                  <option value="value">Max Value</option>
                  <option value="verification">Verification</option>
                  <option value="updated">Updated</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs sm:text-sm">
                  {filteredAirdrops.length} airdrops found
                </span>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Airdrops Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAirdrops.map((airdrop) => (
              <Card key={airdrop.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 group">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl">{airdrop.projectLogo || '🎯'}</div>
                      <div>
                        <CardTitle className="text-white text-sm sm:text-base font-semibold">
                          {airdrop.projectName}
                        </CardTitle>
                        {airdrop.projectSymbol && (
                          <p className="text-slate-400 text-xs sm:text-sm">{airdrop.projectSymbol}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        className={`${getStatusColor(airdrop.status)} text-white text-xs px-2 py-1 flex items-center gap-1`}
                      >
                        {getStatusIcon(airdrop.status)}
                        {airdrop.status}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                        {airdrop.chain}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Confidence & Value */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className={`text-lg sm:text-xl font-bold ${getConfidenceColor(airdrop.confidence)}`}>
                          {airdrop.confidence}%
                        </div>
                        <div className="text-xs text-slate-400">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 text-sm sm:text-base font-semibold">
                          ${airdrop.estimatedValue.min} - ${airdrop.estimatedValue.max}
                        </div>
                        <div className="text-xs text-slate-400">Est. Value</div>
                      </div>
                    </div>

                    {/* Verification Score */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-slate-400">Verification</span>
                        <span className="text-white">{airdrop.verificationScore}/100</span>
                      </div>
                      <Progress 
                        value={airdrop.verificationScore} 
                        className="h-1.5 sm:h-2 bg-slate-700"
                      />
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="text-white text-xs sm:text-sm font-medium mb-2">Requirements:</h4>
                      <div className="space-y-1">
                        {airdrop.requirements.slice(0, 3).map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{req.description}</span>
                          </div>
                        ))}
                        {airdrop.requirements.length > 3 && (
                          <div className="text-xs text-slate-400">
                            +{airdrop.requirements.length - 3} more requirements
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social Metrics */}
                    {airdrop.socialMetrics && (
                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400">
                        {airdrop.socialMetrics.twitterFollowers && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{(airdrop.socialMetrics.twitterFollowers / 1000).toFixed(0)}K</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span className={getRiskColor(airdrop.riskLevel)}>{airdrop.riskLevel} risk</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {airdrop.projectWebsite && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                          onClick={() => window.open(airdrop.projectWebsite, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Check Eligibility
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAirdrops.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 sm:p-12 text-center">
              <Gift className="h-12 w-12 sm:h-16 sm:w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Airdrops Found</h3>
              <p className="text-slate-400 mb-4 text-sm sm:text-base">
                No verified airdrops match your current filters. Try adjusting your search criteria.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedChain('all');
                  setSelectedStatus('all');
                }} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AirdropScanner;
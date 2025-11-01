import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OpportunityRadar } from './components/OpportunityRadar';
import { SecurityScanner } from './components/SecurityScanner';
import { AlphaVault } from './components/AlphaVault';
import { DeveloperFeed } from './components/DeveloperFeed';
import { CommunityHub } from './components/CommunityHub';
import AirdropScanner from './components/AirdropScanner';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard searchQuery={searchQuery} />;
      case 'radar':
        return <OpportunityRadar searchQuery={searchQuery} />;
      case 'security':
        return <SecurityScanner searchQuery={searchQuery} />;
      case 'vault':
        return <AlphaVault />;
      case 'airdrops':
        return <AirdropScanner />;
      case 'dev':
        return <DeveloperFeed searchQuery={searchQuery} />;
      case 'community':
        return <CommunityHub />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Layout activeTab={activeTab} onTabChange={setActiveTab} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
          {renderContent()}
        </Layout>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
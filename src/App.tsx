import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OpportunityRadar } from './components/OpportunityRadar';
import { SecurityScanner } from './components/SecurityScanner';
import { AlphaVault } from './components/AlphaVault';
import { DeveloperFeed } from './components/DeveloperFeed';
import { CommunityHub } from './components/CommunityHub';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'radar':
        return <OpportunityRadar />;
      case 'security':
        return <SecurityScanner />;
      case 'vault':
        return <AlphaVault />;
      case 'dev':
        return <DeveloperFeed />;
      case 'community':
        return <CommunityHub />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
      <Toaster />
    </div>
  );
}
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NotificationCenter } from './NotificationCenter';
import { Settings } from './Settings';
import { 
  Search, 
  Settings as SettingsIcon, 
  Moon, 
  Sun,
  Menu,
  X,
  Zap,
  Shield,
  TrendingUp,
  Code,
  Users,
  Archive,
  Gift
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Feed', icon: TrendingUp },
  { id: 'radar', label: 'Radar', icon: Zap },
  { id: 'security', label: 'Scanner', icon: Shield },
  { id: 'vault', label: 'Vault', icon: Archive },
  { id: 'airdrops', label: 'Airdrops', icon: Gift },
  { id: 'dev', label: 'Dev Feed', icon: Code },
  { id: 'community', label: 'Community', icon: Users }
];

export function Layout({ children, activeTab, onTabChange, searchQuery, onSearchChange }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Dog icon */}
                  <path d="M17 5C17 3.9 16.1 3 15 3H9C7.9 3 7 3.9 7 5M17 5V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V5M17 5H7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M11 8.5C11 9.33 10.33 10 9.5 10C8.67 10 8 9.33 8 8.5C8 7.67 8.67 7 9.5 7C10.33 7 11 7.67 11 8.5Z" fill="white"/>
                  <path d="M16 8.5C16 9.33 15.33 10 14.5 10C13.67 10 13 9.33 13 8.5C13 7.67 13.67 7 14.5 7C15.33 7 16 7.67 16 8.5Z" fill="white"/>
                  <path d="M13.5 14.5C13.5 14.5 13 16 12 16C11 16 10.5 14.5 10.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 13L4 10L3 13L4 16L7 13Z" fill="white"/>
                  <path d="M17 13L20 10L21 13L20 16L17 13Z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-foreground">
                  TraceDog
                </span>
                <span className="text-xs text-muted-foreground font-medium -mt-1">
                  Alpha Hunter
                </span>
              </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="flex-none w-36 sm:w-48 md:w-72 ml-4 md:ml-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tokens, projects, or alpha..."
                className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside 
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out`}
          initial={false}
        >
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.id === 'radar' && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    LIVE
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>

          {/* Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Hunter Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Scanning 15 sources for alpha signals...
              </p>
            </div>
          </div>
        </motion.aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      <Settings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
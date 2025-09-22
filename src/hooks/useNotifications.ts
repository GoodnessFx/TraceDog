import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Alert } from '../types';

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'High Confidence Signal',
    message: 'New trading opportunity detected with 89% confidence: PEPE breakout pattern',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    actionUrl: '/radar'
  },
  {
    id: '2',
    type: 'security',
    title: 'Security Alert',
    message: 'Suspicious activity detected in SAFEMEME token contract',
    priority: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    actionUrl: '/security'
  },
  {
    id: '3',
    type: 'dev',
    title: 'New Framework Release',
    message: 'Viem 2.0 has been released with improved TypeScript support',
    priority: 'medium',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    actionUrl: '/dev'
  }
];

export function useNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = alerts.filter(alert => !alert.read).length;
    setUnreadCount(unread);
  }, [alerts]);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const showToast = (alert: Alert, showDogImage = false) => {
    const toastFunction = alert.priority === 'critical' ? toast.error :
                         alert.priority === 'high' ? toast.warning :
                         toast.info;

    // If it's a high-confidence alpha signal, show the dog image
    if (showDogImage && alert.type === 'opportunity' && alert.priority === 'high') {
      toast.success(alert.title, {
        description: (
          <div className="flex items-center gap-3">
            <img 
              src="https://images.unsplash.com/photo-1693615775129-f2004d6e3e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGdvbGRlbiUyMHJldHJpZXZlciUyMGRvZyUyMHNtaWxpbmd8ZW58MXx8fHwxNzU4NTUyODUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Happy Tracedog"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">🎉 Alpha Found!</p>
              <p className="text-sm opacity-80">{alert.message}</p>
            </div>
          </div>
        ),
        duration: 6000, // Show longer for alpha signals
        action: alert.actionUrl ? {
          label: 'View Signal',
          onClick: () => {
            window.location.hash = alert.actionUrl;
          }
        } : undefined
      });
    } else {
      toastFunction(alert.title, {
        description: alert.message,
        action: alert.actionUrl ? {
          label: 'View',
          onClick: () => {
            window.location.hash = alert.actionUrl;
          }
        } : undefined
      });
    }
  };

  const simulateNewAlert = () => {
    // Generate random alert types and priorities
    const alertTypes = ['opportunity', 'security', 'dev', 'news'] as const;
    const priorities = ['low', 'medium', 'high', 'critical'] as const;
    
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // Higher chance for high-confidence alpha signals
    const isAlphaSignal = randomType === 'opportunity' && Math.random() < 0.3;
    
    const messages = {
      opportunity: [
        'New high-confidence alpha signal detected by Tracedog AI',
        'Strong trading opportunity identified with 85%+ confidence',
        'AI scanner found potential breakout pattern',
        'DeFi yield opportunity discovered',
        'Arbitrage opportunity detected'
      ],
      security: [
        'Suspicious activity detected in smart contract',
        'Potential rug pull warning for trending token',
        'Liquidity lock expiration alert',
        'Dev wallet movement detected'
      ],
      dev: [
        'New protocol upgrade announcement',
        'Security vulnerability disclosed',
        'Major framework update released',
        'Bug bounty program launched'
      ],
      news: [
        'Breaking: Major exchange listing announced',
        'Regulatory news affecting crypto markets',
        'Institutional adoption milestone reached',
        'Market sentiment shift detected'
      ]
    };

    const titles = {
      opportunity: 'Alpha Signal Detected 🎯',
      security: 'Security Alert ⚠️',
      dev: 'Developer Update 👨‍💻',
      news: 'Market News 📰'
    };

    const newAlert: Alert = {
      id: Date.now().toString(),
      type: randomType,
      title: titles[randomType],
      message: messages[randomType][Math.floor(Math.random() * messages[randomType].length)],
      priority: isAlphaSignal ? 'high' : randomPriority,
      read: false,
      createdAt: new Date(),
      actionUrl: randomType === 'opportunity' ? '/dashboard' : `/${randomType}`
    };

    setAlerts(prev => [newAlert, ...prev]);
    
    // Show dog image for high-confidence alpha signals
    const showDog = isAlphaSignal || (randomType === 'opportunity' && randomPriority === 'high');
    showToast(newAlert, showDog);
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        simulateNewAlert();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    showToast
  };
}
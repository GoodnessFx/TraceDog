import { config } from '@/config';

export type AlertPayload = {
  type: 'whale' | 'token' | 'rug' | 'price' | 'liquidity';
  title: string;
  message: string;
  severity?: 'info' | 'warn' | 'critical';
  data?: Record<string, unknown>;
};

export async function sendAlert(payload: AlertPayload): Promise<boolean> {
  if (!config.features.alerts) return false;
  // Touch payload to satisfy strict noUnusedParameters rules
  void payload;
  // Placeholder for future integrations (Telegram/Discord/Email/Twitter)
  // Currently no-op to avoid side effects.
  return true;
}
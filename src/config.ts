type BoolEnv = string | boolean | undefined;

const bool = (v: BoolEnv, fallback = false) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
  return fallback;
};

export const config = {
  app: {
    env: import.meta.env.VITE_APP_ENV ?? 'production',
    name: import.meta.env.VITE_APP_NAME ?? 'TraceDog',
    version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  },
  apis: {
    etherscan: import.meta.env.VITE_ETHERSCAN_API_KEY ?? '',
    bscscan: import.meta.env.VITE_BSCSCAN_API_KEY ?? '',
    polygonscan: import.meta.env.VITE_POLYGONSCAN_API_KEY ?? '',
    dune: import.meta.env.VITE_DUNE_API_KEY ?? '',
    tokensniffer: import.meta.env.VITE_TOKENSNIFFER_API_KEY ?? '',
    honeypot: import.meta.env.VITE_HONEYPOT_API_KEY ?? '',
    twitter: import.meta.env.VITE_TWITTER_API_KEY ?? '',
    twitterSecret: import.meta.env.VITE_TWITTER_API_SECRET ?? '',
  },
  observability: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN ?? '',
  },
  features: {
    alerts: bool(import.meta.env.VITE_FEATURE_ALERTS, true),
    airdrops: bool(import.meta.env.VITE_FEATURE_AIRDROPS, true),
    copyTrading: bool(import.meta.env.VITE_FEATURE_COPY_TRADING, false),
  },
} as const;

export type AppConfig = typeof config;
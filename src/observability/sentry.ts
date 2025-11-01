import * as Sentry from '@sentry/react';
import { config } from '@/config';

export function initSentry() {
  if (!config.observability.sentryDsn) return;
  Sentry.init({
    dsn: config.observability.sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 0.2,
    environment: config.app.env,
    release: `${config.app.name}@${config.app.version}`,
  });
}
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initializeSentry(): void {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: true,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    debug: process.env.NODE_ENV === 'development',
    integrations: [
      new Sentry.ReactNativeTracing({
        enableNativeFramesTracking: true,
        enableAppStartTracking: true,
      }),
    ],
  });
}

export function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.captureException(error, {
      contexts: {
        app: context,
      },
    });
  } else {
    Sentry.captureException(error);
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
): void {
  Sentry.captureMessage(message, level);
}

export function setUser(userId: string, email?: string, name?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export function addBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel
): void {
  Sentry.addBreadcrumb({
    message,
    category: category || 'default',
    level: level || 'info',
  });
}

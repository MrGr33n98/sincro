import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

// Initialize Sentry
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn("[Sentry] DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "development",
    release: import.meta.env.VITE_SENTRY_RELEASE || "main",
    
    // Performance Monitoring
    tracesSampleRate: 0.1,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Ignore common errors that don't need tracking
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'NetworkError',
      'Network request failed',
      // Random plugins/extensions
      'atomicFindClose',
      'fb_xd_fragment',
      // Other plugins
      'CanvasRenderingContext2D',
    ],
    
    // Ignore specific URLs
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Check if it's an exception
      const exception = hint.originalException;
      
      // Ignore errors from specific sources
      if (exception && typeof exception === 'object' && 'target' in exception) {
        const target = exception.target as HTMLElement;
        if (target.tagName === 'SCRIPT' && target.src.includes('extension://')) {
          return null;
        }
      }
      
      return event;
    },
  });
}

// Initialize PostHog
export function initPostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
  
  if (!apiKey) {
    console.warn("[PostHog] API key not configured, skipping initialization");
    return;
  }

  try {
    posthog.init(apiKey, {
      api_host: host,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        recordCrossOriginIframes: false,
      },
      // Disable in development if needed
      disable_session_recording: import.meta.env.DEV,
      // Person properties
      person_profiles: 'identified_only',
    });
  } catch (error) {
    console.error("[PostHog] Initialization error:", error);
  }
}

// Identify user in PostHog
export function identifyUser(user: { id: string | number; email: string }) {
  if (!user || !user.id) return;
  
  try {
    posthog.identify(String(user.id), {
      email: user.email,
      $email: user.email,
    });
  } catch (error) {
    console.error("[PostHog] Identify error:", error);
  }
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error("[PostHog] Track error:", error);
  }
}

// Export for direct use
export { Sentry, posthog };

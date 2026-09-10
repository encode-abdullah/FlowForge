import { MAX_RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS } from '@flowforge/shared';

export interface RetryConfig {
  maxAttempts: number;
  backoff: 'fixed' | 'exponential';
  delayMs: number;
  retryOn: string[];
}

const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: MAX_RETRY_ATTEMPTS,
  backoff: 'exponential',
  delayMs: RETRY_BASE_DELAY_MS,
  retryOn: ['timeout', 'network', 'temporary', 'ECONNRESET', 'ETIMEDOUT'],
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const shouldRetry =
        attempt < fullConfig.maxAttempts &&
        fullConfig.retryOn.some(
          (pattern) =>
            lastError!.message.includes(pattern) ||
            lastError!.name.includes(pattern),
        );

      if (shouldRetry) {
        const delay =
          fullConfig.backoff === 'exponential'
            ? fullConfig.delayMs * Math.pow(2, attempt - 1)
            : fullConfig.delayMs;

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
